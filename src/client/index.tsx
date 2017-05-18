import * as theMoment from 'moment'
import * as r from 'raynor'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Provider, connect } from 'react-redux'
import { Router, Route, IndexRoute, IndexRedirect, Link, browserHistory } from 'react-router'

import { Currency, StandardCurrencies, CurrencyMarshaller } from '@neoncity/common-js/currency'
import { isLocal } from '@neoncity/common-js/env'
import { slugify } from '@neoncity/common-js/slugify'
import { BankInfo,
	 Cause,
         CauseAnalytics,
	 CurrencyAmount,
	 PictureSet,
	 PrivateCause,
	 PublicCause,
	 UserActionsOverview,
	 TitleMarshaller,
	 DescriptionMarshaller} from '@neoncity/core-sdk-js'
import { User } from '@neoncity/identity-sdk-js'

import { accessToken } from './access-token'
import { clearAccessToken } from './access-token-storage'
import { AdminAccountView } from './admin-account-view'
import { AppFrame } from './app-frame'
import { showAuth0Lock } from './auth0'
import { BankInfoWidget } from './bank-info-widget'
import * as config from './config'
import { DonationForUserWidget } from './donation-for-user-widget'
import { ImageGallery } from './image-gallery'
import { ImageGalleryEditor } from './image-gallery-editor'
import './index.less'
import { ShareForUserWidget } from './share-for-user-widget'
import { corePublicClient, corePrivateClient, fileStorageService } from './services'
import { AdminCauseAnalyticsState, AdminMyActionsState, AdminMyCauseState, OpState, PublicCausesState, PublicCauseDetailState, StatePart, store } from './store'
import { UserInput, UserInputMaster } from './user-input'

// Old style imports.
const moment = require('moment')


interface IdentityFrameProps {
    isInit: boolean;
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    user: User|null;
}


class _IdentityFrame extends React.Component<IdentityFrameProps, undefined> {
    render() {
        if (!this.props.isReady) {
	    return (<div>Logging in ...</div>);
	} else {
	    return (<div>{this.props.children}</div>);
	}
    }
}


function identityFrameMapStateToProps(state: any) {
    return {
        isInit: state.identity.type == OpState.Init,
        isLoading: state.identity.type == OpState.Loading,
        isReady: state.identity.type == OpState.Ready,
        isFailed: state.identity.type == OpState.Failed,
        user: state.identity.type == OpState.Ready ? state.identity.user : null
    };
}


function identityFrameMapDispatchToProps() {
    return {};
}


const IdentityFrame = connect(
    identityFrameMapStateToProps,
    identityFrameMapDispatchToProps)(_IdentityFrame);


interface PublicCauseWidgetProps {
    isIdentityReady: boolean;
    cause: PublicCause;
}

interface PublicCauseWidgetState {
    donationAmount: UserInput<number, number>;
    donationState: OpState;
    shareState: OpState;
}


class PublicCauseWidget extends React.Component<PublicCauseWidgetProps, PublicCauseWidgetState> {
    private static readonly _initialState: PublicCauseWidgetState = {
        donationAmount: new UserInput<number, number>(10, 10),
        donationState: OpState.Init,
        shareState: OpState.Init
    };

    private readonly _donationAmountMaster: UserInputMaster<number, number>;
    
    constructor(props: PublicCauseWidgetProps, context: any) {
        super(props, context);
        this.state = (Object as any).assign({}, PublicCauseWidget._initialState);
	this._donationAmountMaster = new UserInputMaster<number, number>(new r.PositiveIntegerMarshaller());
    }
    
    render() {
        const allValid = !this.state.donationAmount.isInvalid();
        
        let donationResult = <span></span>;
        switch (this.state.donationState) {
        case OpState.Loading:
            donationResult = <span>Donating</span>;
            break;
        case OpState.Ready:
            donationResult = <span>Ready</span>;
            break;
        case OpState.Failed:
            donationResult = <span>Failed</span>;
            break;
        } 
        
        let shareResult = <span></span>;
        switch (this.state.shareState) {
        case OpState.Loading:
            shareResult = <span>Sharing</span>;
            break;
        case OpState.Ready:
            shareResult = <span>Ready</span>;
            break;
        case OpState.Failed:
            shareResult = <span>Failed</span>;
            break;
        }
        
	return (
            <div>
	        <h2><Link to={_causeLink(this.props.cause)}>{this.props.cause.title}</Link></h2>
		<p>{this.props.cause.description}</p>
		<p>{this.props.cause.goal.amount} - {this.props.cause.goal.currency.toString()}</p>
		<p>{this.props.cause.deadline.toString()}</p>
                <ImageGallery pictureSet={this.props.cause.pictureSet} />
                <button type="button" onClick={_ => this._handleSetDonationAmount(10)}>10</button>
                <button type="button" onClick={_ => this._handleSetDonationAmount(25)}>25</button>
                <button type="button" onClick={_ => this._handleSetDonationAmount(50)}>50</button>
                <span>{this.state.donationAmount.getValue()} - {this.props.cause.goal.currency.toString()}</span>
                <button disabled={!allValid} type="button" onClick={this._handleDonate.bind(this)}>Donate</button>
                {donationResult}
                <button type="button" onClick={this._handleShare.bind(this)}>Share</button>
                {shareResult}
	    </div>
	);
    }

    private _handleSetDonationAmount(amount: number) {
        this.setState({donationAmount: this._donationAmountMaster.transform(amount, this.state.donationAmount.getValue())});
    }

    private async _handleDonate() {
        // TODO: Handle triggering the donate afterwards.
        if (!this.props.isIdentityReady) {
	    clearAccessToken();
	    showAuth0Lock();
            return;
        }
        
        this.setState({donationState: OpState.Loading});
        
        try {
            const currencyAmount = new CurrencyAmount();
            currencyAmount.amount = this.state.donationAmount.getValue();
            currencyAmount.currency = this.props.cause.goal.currency;
            
            await corePublicClient.createDonation(accessToken, this.props.cause.id, currencyAmount);
            this.setState({donationState: OpState.Ready});
        } catch (e) {
            if (isLocal(config.ENV)) {
                console.log(e);
            }
            
            this.setState({donationState: OpState.Failed});
        }
    }

    private _handleShare() {
        // TODO: Handle triggering the share afterwards.
        if (!this.props.isIdentityReady) {
	    showAuth0Lock();
            return;
        }
        
        const href = `${window.location.protocol}//${window.location.hostname}:${window.location.port}${_causeLink(this.props.cause)}`;

        this.setState({shareState: OpState.Loading});
        
        FB.ui({
            method: 'share',
            href: href
        }, async (response: facebook.ShareDialogResponse) => {
            console.log(response);
            if (typeof response === 'undefined') {
                // User closed dialog without sharing.
                this.setState({shareState: OpState.Failed});
                return;
            }

            if (response.hasOwnProperty('error_message')) {
                this.setState({shareState: OpState.Failed});
                return;
            }

            if (!response.hasOwnProperty('post_id')) {
                this.setState({shareState: OpState.Failed});
                return;
            }

            try {
                await corePublicClient.createShare(accessToken, this.props.cause.id, response.post_id as string);
                this.setState({shareState: OpState.Ready});
            } catch (e) {
                if (isLocal(config.ENV)) {
                    console.log(e);
                }
                
                this.setState({shareState: OpState.Failed});
            }
        });
    }
}


interface HomeViewProps {
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    isIdentityReady: boolean;
    causes: PublicCause[]|null;
    errorMessage: string|null;
    onPublicCausesLoading: () => void;
    onPublicCausesReady: (causes: PublicCause[]) => void;
    onPublicCausesFailed: (errorMessage: string) => void;
}


class _HomeView extends React.Component<HomeViewProps, undefined> {
    async componentDidMount() {
	this.props.onPublicCausesLoading();

	try {
	    const causes = await corePublicClient.getCauses(accessToken);
	    this.props.onPublicCausesReady(causes);
	} catch (e) {
            if (isLocal(config.ENV)) {
                console.log(e);
            }
            
	    this.props.onPublicCausesFailed('Could not load public causes');
	}
    }
    
    render() {
	if (this.props.isLoading) {
	    return (<div>Loading ...</div>);
	} else if (this.props.isFailed) {
	    return (<div>Failed {this.props.errorMessage}</div>);
	} else {
	    const causes = (this.props.causes as PublicCause[]).map(c => <PublicCauseWidget key={c.id} cause={c} isIdentityReady={this.props.isIdentityReady} />);
	    
	    return (<div>{causes}</div>);
	}
    }
}


function homeViewMapStateToProps(state: any) {
    return {
	isLoading: state.publicCauses.type == OpState.Init || state.publicCauses.type == OpState.Loading,
	isReady: state.publicCauses.type == OpState.Ready,
	isFailed: state.publicCauses.type == OpState.Failed,
        isIdentityReady: state.identity.type == OpState.Ready,
	causes: state.publicCauses.type == OpState.Ready ? state.publicCauses.causes : null,
	errorMessage: state.publicCauses.type == OpState.Failed ? state.publicCauses.errorMessage : null,
    };
}


function homeViewMapDispatchToProps(dispatch: (newState: PublicCausesState) => void) {
    return {
	onPublicCausesLoading: () => dispatch({part: StatePart.PublicCauses, type: OpState.Loading}),
	onPublicCausesReady: (causes: PublicCause[]) => dispatch({part: StatePart.PublicCauses, type: OpState.Ready, causes: causes}),
	onPublicCausesFailed: (errorMessage: string) => dispatch({part: StatePart.PublicCauses, type: OpState.Failed, errorMessage: errorMessage})
    };
}


const HomeView = connect(
    homeViewMapStateToProps,
    homeViewMapDispatchToProps)(_HomeView);


interface CauseViewParams {
    causeId: string;
    causeSlug: string;
}


interface CauseViewProps {
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    isIdentityReady: boolean;
    params: CauseViewParams;
    cause: PublicCause|null;
    errorMessage: string|null;
    onPublicCauseDetailLoading: () => void;
    onPublicCauseDetailReady: (cause: PublicCause) => void;
    onPublicCauseDetailFailed: (errorMessage: string) => void;
}


class _CauseView extends React.Component<CauseViewProps, undefined> {
    async componentDidMount() {
	this.props.onPublicCauseDetailLoading();

	try {
	    const causeId = parseInt(this.props.params.causeId);
	    const cause = await corePublicClient.getCause(accessToken, causeId);
	    this.props.onPublicCauseDetailReady(cause);
	    // Also update the URL to be _causeLink(cause), but it should do no navigation.
	    // Users might access this as /c/$id/$firstSlug, but the actual slug assigned
	    // might be $secondSlog. So we wish to replace the one they specified with
	    // /c/$id/$secondSlug
	    browserHistory.replace(_causeLink(cause));
	} catch (e) {
	    if (isLocal(config.ENV)) {
                console.log(e);
            }
            
	    this.props.onPublicCauseDetailFailed('Could not load public cause detail');
	}
    }
    
    render() {
	if (this.props.isLoading) {
	    return (<div>Loading ...</div>);
	} else if (this.props.isFailed) {
	    return (<div>Failed {this.props.errorMessage}</div>);
	} else {
	    return <PublicCauseWidget cause={this.props.cause as PublicCause} isIdentityReady={this.props.isIdentityReady} />;
	}
    }
}


function causeViewMapStateToProps(state: any) {
    return {
	isLoading: state.publicCauseDetail.type == OpState.Init || state.publicCauseDetail.type == OpState.Loading,
	isReady: state.publicCauseDetail.type == OpState.Ready,
	isFailed: state.publicCauseDetail.type == OpState.Failed,
        isIdentityReady: state.identity.type == OpState.Ready,
	cause: state.publicCauseDetail.type == OpState.Ready ? state.publicCauseDetail.cause : null,
	errorMessage: state.publicCauseDetail.type == OpState.Failed ? state.publicCauseDetail.errorMessage : null,
    };
}


function causeViewMapDispatchToProps(dispatch: (newState: PublicCauseDetailState) => void) {
    return {
	onPublicCauseDetailLoading: () => dispatch({part: StatePart.PublicCauseDetail, type: OpState.Loading}),
	onPublicCauseDetailReady: (cause: PublicCause) => dispatch({part: StatePart.PublicCauseDetail, type: OpState.Ready, cause: cause}),
	onPublicCauseDetailFailed: (errorMessage: string) => dispatch({part: StatePart.PublicCauseDetail, type: OpState.Failed, errorMessage: errorMessage})
    };
}


const CauseView = connect(
    causeViewMapStateToProps,
    causeViewMapDispatchToProps)(_CauseView);


interface AdminFrameProps {
    user: User;
    children: React.ReactNode;
}


class AdminFrame extends React.Component<AdminFrameProps, undefined> {
    render() {
        return (
            <div>
                <div>This is the admin view</div>
                <Link to="/admin/my-cause">My Cause</Link>
                <Link to="/admin/cause-analytics">Cause Analytics</Link>
                <Link to="/admin/my-actions">My Actions</Link>
                <Link to="/admin/account">Account</Link>
                {this.props.children}
            </div>
        );
    }
}


interface AdminMyCauseProps {
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    hasCause: boolean;
    causeIsDeleted: boolean;
    cause: PrivateCause|null;
    errorMessage: string|null;
    onPrivateCauseLoading: () => void;
    onPrivateCauseReady: (hasCause: boolean, causeIsDelted: boolean, cause: PrivateCause|null) => void;
    onPrivateCauseFailed: (errorMessage: string) => void;
}


interface AdminMyCauseViewState {
    showCreationFormIfNoControls: boolean;
    modifiedGeneral: boolean;
    title: UserInput<string, string>;
    slug: UserInput<string, string>;
    description: UserInput<string, string>;
    deadline: theMoment.Moment;
    goalAmount: UserInput<string, number>;
    goalCurrency: UserInput<string, Currency>;
    bankInfo: BankInfo;
    pictureSet: PictureSet;
}


class _AdminMyCauseView extends React.Component<AdminMyCauseProps, AdminMyCauseViewState> {
    private static readonly _initialState = {
	showCreationFormIfNoControls: false,
	modifiedGeneral: false,
	title: new UserInput<string, string>('', ''),
	slug: new UserInput<string, string>('', ''),
	description: new UserInput<string, string>('', ''),
	deadline: moment(),
	goalAmount: new UserInput<string, number>('100', 100),
	goalCurrency: new UserInput<string, Currency>('RON', StandardCurrencies.RON),
        bankInfo: {ibans: []},
        pictureSet: new PictureSet()
    };

    private readonly _titleMaster: UserInputMaster<string, string>;
    private readonly _slugMaster: UserInputMaster<string, string>;
    private readonly _descriptionMaster: UserInputMaster<string, string>;
    private readonly _goalAmountMaster: UserInputMaster<string, number>;
    private readonly _goalCurrencyMaster: UserInputMaster<string, Currency>;
    
    constructor(props: AdminMyCauseProps, context: any) {
	super(props, context);
	this.state = (Object as any).assign({}, _AdminMyCauseView._initialState);
	this._titleMaster = new UserInputMaster<string, string>(new TitleMarshaller());
	this._slugMaster = new UserInputMaster<string, string>(new r.SlugMarshaller());
	this._descriptionMaster = new UserInputMaster<string, string>(new DescriptionMarshaller());
	this._goalAmountMaster = new UserInputMaster<string, number>(new r.PositiveIntegerFromStringMarshaller());
	this._goalCurrencyMaster = new UserInputMaster<string, Currency>(new CurrencyMarshaller());
    }
    
    async componentDidMount() {
        this.props.onPrivateCauseLoading();

        try {
            const privateCause = await corePrivateClient.getCause(accessToken);
            this.props.onPrivateCauseReady(true, false, privateCause);
        } catch (e) {
            if (e.name == 'NoCauseForUserError') {
                this.props.onPrivateCauseReady(false, false, null);
	    } else if (e.name == 'CauseDeletedForUserError') {
                this.props.onPrivateCauseReady(true, true, null);
            } else {
                if (isLocal(config.ENV)) {
                    console.log(e);
                }
            
                this.props.onPrivateCauseFailed('Could not load cause for user');
            }
        }
    }

    componentWillReceiveProps(newProps: AdminMyCauseProps) {
	if (newProps.isReady) {
	    this.setState(this._fullStateFromProps(newProps));
	}
    }

    componentWillMount() {
	if (this.props.isReady) {
	    this.setState(this._fullStateFromProps(this.props));
	}
    }
    
    render() {
	const allValid = !(this.state.title.isInvalid()
			   || this.state.slug.isInvalid()
			   || this.state.description.isInvalid()
			   || this.state.goalAmount.isInvalid()
			   || this.state.goalCurrency.isInvalid());

        let titleModifiedRegion = <span></span>;
        if (this.state.title.isModified()) {
            titleModifiedRegion = <span>Modified</span>;
        }

        let titleWarningRegion = <span></span>;
        if (this.state.title.isInvalid()) {
            titleWarningRegion = <span>Invalid title value</span>;
        }

        let slugModifiedRegion = <span></span>;
        if (this.state.slug.isModified()) {
            slugModifiedRegion = <span>Modified</span>;
        }

        let slugWarningRegion = <span></span>;
        if (this.state.slug.isInvalid()) {
            slugWarningRegion = <span>Invalid slug value</span>;
        }

        let descriptionModifiedRegion = <span></span>;
        if (this.state.description.isModified()) {
            descriptionModifiedRegion = <span>Modified</span>;
        }

        let descriptionWarningRegion = <span></span>;
        if (this.state.description.isInvalid()) {
            descriptionWarningRegion = <span>Invalid description value</span>;
        }

        let goalAmountModifiedRegion = <span></span>;
        if (this.state.goalAmount.isModified()) {
            goalAmountModifiedRegion = <span>Modified</span>;
        }

        let goalAmountWarningRegion = <span></span>;
        if (this.state.goalAmount.isInvalid()) {
            goalAmountWarningRegion = <span>Invalid goal amount value</span>;
        }

        let goalCurrencyModifiedRegion = <span></span>;
        if (this.state.goalCurrency.isModified()) {
            goalCurrencyModifiedRegion = <span>Modified</span>;
        }

        let goalCurrencyWarningRegion = <span></span>;
        if (this.state.goalCurrency.isInvalid()) {
            goalCurrencyWarningRegion = <span>Invalid goal currency value</span>;
        }        
	
        const editForm = (
		<div>
                <form>
                <div>
                <label htmlFor="admin-my-cause-title">Title</label>
                <input
	    id="admin-my-cause-title"
	    type="text"
	    value={this.state.title.getUserInput()}
	    onChange={this._handleTitleChange.bind(this)}
	    placeholder="Cause title..." />
                {titleModifiedRegion} {titleWarningRegion}
                </div>
                <div>
                <label htmlFor="admin-my-cause-slug">URL</label>
                <input id="admin-my-cause-slug" value={this.state.slug.getValue()} disabled={true} placeholder="URL..." />
                {slugModifiedRegion} {slugWarningRegion}
                </div>
                <div>
                <label htmlFor="admin-my-cause-description">Description</label>
                <input id="admin-my-cause-description" type="text" value={this.state.description.getUserInput()} onChange={this._handleDescriptionChange.bind(this)} placeholder="Cause description..." />
                </div>
                {descriptionModifiedRegion} {descriptionWarningRegion}
                <div>
                <label htmlFor="admin-my-cause-deadline">Deadline</label>
                <ReactDatePicker id="admin-my-cause-deadline" selected={this.state.deadline} onChange={this._handleDeadlineChange.bind(this)} />
                </div>
                <div>
                <label htmlFor="admin-my-cause-goal-amount">Goal amount</label>
                <input id="admin-my-cause-goal-amount" type="number" value={this.state.goalAmount.getUserInput()} onChange={this._handleGoalAmountChange.bind(this)} placeholder="100" />
                </div>
                {goalAmountModifiedRegion} {goalAmountWarningRegion}
                <div>
                <label htmlFor="admin-my-cause-goal-currency">Goal currency</label>
                <select id="admin-my-cause-goal-currency" value={this.state.goalCurrency.getUserInput()} onChange={this._handleGoalCurrencyChange.bind(this)}>
                <option value="RON">RON</option>
		<option value="USD">USD</option>
                <option value="EUR">EUR</option>
                </select>
                {goalCurrencyModifiedRegion} {goalCurrencyWarningRegion}
                </div>
                <div>
                <BankInfoWidget bankInfo={this.state.bankInfo} onBankInfoChange={this._handleBankInfoChange.bind(this)} />
                <ImageGalleryEditor pictureSet={this.state.pictureSet} selectPicture={pos => fileStorageService.selectImageWithWidget(pos)} onPictureSetChange={this._handlePictureSetChange.bind(this)} />
                </div>
                </form>
		</div>
        );
	
	if (this.props.isLoading) {
	    return (<div>Loading ...</div>);
	} else if (this.props.isFailed) {
	    return (<div>Failed {this.props.errorMessage}</div>);
	} else if (!this.props.hasCause) {
	    if (!this.state.showCreationFormIfNoControls) {
		return (<div>There is no cause<button onClick={this._handleShowCreationForm.bind(this)}>Create cause</button></div>);
	    } else {
		return (
                    <div>
                        Creation form {editForm}
                        <div>
                            <button disabled={!this.state.modifiedGeneral} onClick={this._handleResetGeneral.bind(this)}>Reset</button>
                            <button disabled={!this.state.modifiedGeneral || !allValid} onClick={this._handleCreate.bind(this)}>Create</button>
                        </div>
		    </div>
		);
            }
	} else if (this.props.causeIsDeleted) {
	    return <div>The cause has been deleted. If you wish to undelete it, speak to one of our admins.</div>;
        } else {
            const cause = this.props.cause as PrivateCause;
            
            return (
                <div>
                    {cause.title}
                    {editForm}
                    <div>
                        <button disabled={!this.state.modifiedGeneral} onClick={this._handleResetGeneral.bind(this)}>Reset</button>
                        <button disabled={!this.state.modifiedGeneral || !allValid} onClick={this._handleUpdate.bind(this)}>Update</button>
                    </div>
		    <div>
                        <button onClick={this._handleDelete.bind(this)}>Delete Cause</button>
		    </div>
                </div>
	    );
        }
    }

    private _fullStateFromProps(props: AdminMyCauseProps): AdminMyCauseViewState {
	if (!props.hasCause || props.causeIsDeleted) {
	    return (Object as any).assign({}, _AdminMyCauseView._initialState);
	}

	const cause = props.cause as PrivateCause;
	    
	return {
	    showCreationFormIfNoControls: false,
	    modifiedGeneral: false,
	    title: new UserInput<string, string>(cause.title, cause.title),
	    slug: new UserInput<string, string>(cause.slug, cause.slug),
	    description: new UserInput<string, string>(cause.description, cause.description),
	    deadline: moment(cause.deadline),
	    goalAmount: new UserInput<string, number>(cause.goal.amount.toString(), cause.goal.amount),
	    goalCurrency: new UserInput<string, Currency>(cause.goal.currency.toString(), cause.goal.currency),
	    bankInfo: cause.bankInfo,
	    pictureSet: cause.pictureSet
	};
    }

    private _handleShowCreationForm() {
	this.setState({showCreationFormIfNoControls: true});
    }

    private _handleTitleChange(e: React.FormEvent<HTMLInputElement>) {
	this.setState({
	    modifiedGeneral: true,
	    title: this._titleMaster.transform(e.currentTarget.value, this.state.title.getValue()),
	    slug: this._slugMaster.transform(slugify(e.currentTarget.value), this.state.slug.getValue())
	});
    }

    private _handleDescriptionChange(e: React.FormEvent<HTMLInputElement>) {
	this.setState({
	    modifiedGeneral: true,
	    description: this._descriptionMaster.transform(e.currentTarget.value, this.state.description.getValue())
	});
    }

    private _handleDeadlineChange(newDeadline: theMoment.Moment) {
	this.setState({
	    modifiedGeneral: true,
	    deadline: newDeadline
	});
    }

    private _handleGoalAmountChange(e: React.FormEvent<HTMLInputElement>) {
	this.setState({
	    modifiedGeneral: true,
	    goalAmount: this._goalAmountMaster.transform(e.currentTarget.value, this.state.goalAmount.getValue())
	});
    }

    private _handleGoalCurrencyChange(e: React.FormEvent<HTMLInputElement>) {
	this.setState({
	    modifiedGeneral: true,
	    goalCurrency: this._goalCurrencyMaster.transform(e.currentTarget.value, this.state.goalCurrency.getValue())
	});
    }

    private _handleBankInfoChange(newBankInfo: BankInfo) {
        this.setState({
            modifiedGeneral: true,
            bankInfo: newBankInfo
        });
    }

    private _handlePictureSetChange(newPictureSet: PictureSet) {
        this.setState({
            modifiedGeneral: true,
            pictureSet: newPictureSet
        });
    }

    private _handleResetGeneral() {
        this.setState(this._fullStateFromProps(this.props));
    }

    private async _handleCreate() {
	this.props.onPrivateCauseLoading();

	try {
	    const goal: CurrencyAmount = new CurrencyAmount();
	    goal.amount = this.state.goalAmount.getValue();
	    goal.currency = this.state.goalCurrency.getValue();
	    
	    const privateCause = await corePrivateClient.createCause(
		accessToken,
		this.state.title.getValue(),
		this.state.description.getValue(),
		this.state.pictureSet,
		this.state.deadline.toDate(),
		goal,
		this.state.bankInfo);
	    this.props.onPrivateCauseReady(true, false, privateCause);
	} catch (e) {
            if (isLocal(config.ENV)) {
                console.log(e);
            }
            
	    this.props.onPrivateCauseFailed('Could not create cause for user');
	}
    }

    private async _handleUpdate() {
	this.props.onPrivateCauseLoading();

	try {
	    const goal: CurrencyAmount = new CurrencyAmount();
	    goal.amount = this.state.goalAmount.getValue();
	    goal.currency = this.state.goalCurrency.getValue();
	    
	    const privateCause = await corePrivateClient.updateCause(
		accessToken,
		{
		    title: this.state.title.getValue(),
		    description: this.state.description.getValue(),
		    pictureSet: this.state.pictureSet,
		    deadline: this.state.deadline.toDate(),
		    goal: goal,
		    bankInfo: this.state.bankInfo
		});
	    this.props.onPrivateCauseReady(true, false, privateCause);
	} catch (e) {
            if (isLocal(config.ENV)) {
                console.log(e);
            }
            
	    this.props.onPrivateCauseFailed('Could not update cause for user');
	}	
    }

    private async _handleDelete() {
	this.props.onPrivateCauseLoading();

	try {
	    await corePrivateClient.deleteCause(accessToken);
	    this.props.onPrivateCauseReady(true, true, null);
	} catch (e) {
	    if (isLocal(config.ENV)) {
                console.log(e);
            }
            
	    this.props.onPrivateCauseFailed('Could not delete cause for user');
	}	
    }
}


function adminMyCauseMapStateToProps(state: any) {
    return {
	isLoading: state.adminMyCause.type == OpState.Init || state.adminMyCause.type == OpState.Loading,
	isReady: state.adminMyCause.type == OpState.Ready,
	isFailed: state.adminMyCause.type == OpState.Failed,
        hasCause: state.adminMyCause.type == OpState.Ready ? state.adminMyCause.hasCause : false,
	causeIsDeleted: state.adminMyCause.type == OpState.Ready ? state.adminMyCause.causeIsDeleted : false,
        cause: state.adminMyCause.type == OpState.Ready ? state.adminMyCause.cause : null,
	errorMessage: state.adminMyCause.type == OpState.Failed ? state.adminMyCause.errorMessage : null
    };
}


function adminMyCauseMapDispatchToProps(dispatch: (newState: AdminMyCauseState) => void) {
    return {
	onPrivateCauseLoading: () => dispatch({part: StatePart.AdminMyCause, type: OpState.Loading}),
	onPrivateCauseReady: (hasCause: boolean, causeIsDeleted: boolean, cause: PrivateCause) => dispatch({part: StatePart.AdminMyCause, type: OpState.Ready, hasCause, causeIsDeleted, cause}),
	onPrivateCauseFailed: (errorMessage: string) => dispatch({part: StatePart.AdminMyCause, type: OpState.Failed, errorMessage: errorMessage})
    };
}


const AdminMyCauseView = connect(
    adminMyCauseMapStateToProps,
    adminMyCauseMapDispatchToProps)(_AdminMyCauseView);


interface AdminCauseAnalyticsViewProps {
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    hasCause: boolean;
    causeAnalytics: CauseAnalytics|null;
    errorMessage: string|null;
    onCauseAnalyticsLoading: () => void;
    onCauseAnalyticsReady: (hasCause: boolean, causeAnalytics: CauseAnalytics|null) => void;
    onCauseAnalyticsFailed: (errorMessage: string) => void;
}


interface AdminCauseAnalyticsViewState {
}


class _AdminCauseAnalyticsView extends React.Component<AdminCauseAnalyticsViewProps, AdminCauseAnalyticsViewState> {
    async componentDidMount() {
        this.props.onCauseAnalyticsLoading();

        try {
            const causeAnalytics = await corePrivateClient.getCauseAnalytics(accessToken);
            this.props.onCauseAnalyticsReady(true, causeAnalytics);
        } catch (e) {
            if (e.name == 'NoCauseForUserError') {
                this.props.onCauseAnalyticsReady(false, null);
            } else {
                if (isLocal(config.ENV)) {
                    console.log(e);
                }
            
                this.props.onCauseAnalyticsFailed('Could not load cause analytics for user');
            }
        }
    }
    
    render() {
        if (this.props.isLoading) {
            return <div>Loading ...</div>;
	} else if (this.props.isFailed) {
	    return <div>Failed {this.props.errorMessage}</div>;
	} else if (!this.props.hasCause) {
            return <div>There is no cause. Please create one to see analytics</div>;
	} else {
            const causeAnalytics = this.props.causeAnalytics as CauseAnalytics;
            
            return (
                    <div>
                    <p>Days left: {causeAnalytics.daysLeft}</p>
                    <p>Donors count: {causeAnalytics.donorsCount}</p>
                    <p>Donations count: {causeAnalytics.donationsCount}</p>
                    <p>Donatin amount: {causeAnalytics.amountDonated.amount} {causeAnalytics.amountDonated.currency.toString()}</p>
                    <p>Sharers count: {causeAnalytics.sharersCount}</p>
                    <p>Shares count: {causeAnalytics.sharesCount}</p>
                    </div>
            );
        }
    }
}


function adminCauseAnalyticsMapStateToProps(state: any) {
    return {
        isLoading: state.adminCauseAnalytics.type == OpState.Init || state.adminCauseAnalytics.type == OpState.Loading,
        isReady: state.adminCauseAnalytics.type == OpState.Ready,
        isFailed: state.adminCauseAnalytics.type == OpState.Failed,
        hasCause: state.adminCauseAnalytics.type == OpState.Ready ? state.adminCauseAnalytics.hasCause : false,
        causeAnalytics: state.adminCauseAnalytics.type == OpState.Ready ? state.adminCauseAnalytics.causeAnalytics : null,
        errorMessage: state.adminCauseAnalytics.type == OpState.Failed ? state.adminCauseAnalytics.errorMessage : null
    };
}


function adminCauseAnalyticsMapDispatchToProps(dispatch: (newState: AdminCauseAnalyticsState) => void) {
    return {
	onCauseAnalyticsLoading: () => dispatch({part: StatePart.AdminCauseAnalytics, type: OpState.Loading}),
	onCauseAnalyticsReady: (hasCause: boolean, causeAnalytics: CauseAnalytics|null) => dispatch({part: StatePart.AdminCauseAnalytics, type: OpState.Ready, hasCause: hasCause, causeAnalytics: causeAnalytics}),
	onCauseAnalyticsFailed: (errorMessage: string) => dispatch({part: StatePart.AdminCauseAnalytics, type: OpState.Failed, errorMessage: errorMessage})
    };
}


const AdminCauseAnalyticsView = connect(
    adminCauseAnalyticsMapStateToProps,
    adminCauseAnalyticsMapDispatchToProps)(_AdminCauseAnalyticsView);


interface AdminMyActionsProps {
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    userActionsOverview: UserActionsOverview|null;
    errorMessage: string|null;
    onUserActionsOverviewLoading: () => void;
    onUserActionsOverviewReady: (userActionsOverview: UserActionsOverview) => void;
    onUserActionsOverviewFailed: (errorMessage: string) => void;
}


class _AdminMyActionsView extends React.Component<AdminMyActionsProps, undefined> {
    async componentDidMount() {
	this.props.onUserActionsOverviewLoading();

	try {
	    const userActionsOverview = await corePrivateClient.getActionsOverview(accessToken);
	    this.props.onUserActionsOverviewReady(userActionsOverview);
	} catch (e) {
            if (isLocal(config.ENV)) {
                console.log(e);
            }
            
	    this.props.onUserActionsOverviewFailed('Could not load user actions overview');
	}
    }
    
    render() {
	if (this.props.isLoading) {
	    return (<div>Loading ...</div>);
	} else if (this.props.isFailed) {
	    return (<div>Failed {this.props.errorMessage}</div>);
	} else {
	    const donationWidgets = (this.props.userActionsOverview as UserActionsOverview)
		  .donations
		  .slice(0) // clone
		  .sort((a, b) => b.timeCreated.getTime() - a.timeCreated.getTime())
		  .map((d) => <DonationForUserWidget key={d.id} donationForUser={d} />);
	    const shareWidgets = (this.props.userActionsOverview as UserActionsOverview)
		  .shares
		  .slice(0) // clone
		  .sort((a, b) => b.timeCreated.getTime() - a.timeCreated.getTime())
		  .map((d) => <ShareForUserWidget key={d.id} shareForUser={d} />);	    

	    return (
                <div>
		    <h6>Donations</h6>
		    {donationWidgets}
		    <h6>Shares</h6>
		    {shareWidgets}
		</div>
	    );
	}
    }
}


function adminMyActionsMapStateToProps(state: any) {
    return {
	isLoading: state.adminMyActions.type == OpState.Init || state.adminMyActions.type == OpState.Loading,
	isReady: state.adminMyActions.type == OpState.Ready,
	isFailed: state.adminMyActions.type == OpState.Failed,
	userActionsOverview: state.adminMyActions.type == OpState.Ready ? state.adminMyActions.userActionsOverview : null,
	errorMessage: state.adminMyActions.type == OpState.Failed ? state.adminMyActions.errorMessage : null
    };
}


function adminMyActionsMapDispatchToProps(dispatch: (newState: AdminMyActionsState) => void) {
    return {
	onUserActionsOverviewLoading: () => dispatch({part: StatePart.AdminMyActions, type: OpState.Loading}),
	onUserActionsOverviewReady: (userActionsOverview: UserActionsOverview) => dispatch({part: StatePart.AdminMyActions, type: OpState.Ready, userActionsOverview: userActionsOverview}),
	onUserActionsOverviewFailed: (errorMessage: string) => dispatch({part: StatePart.AdminMyActions, type: OpState.Failed, errorMessage: errorMessage})
    };
}


const AdminMyActionsView = connect(
    adminMyActionsMapStateToProps,
    adminMyActionsMapDispatchToProps)(_AdminMyActionsView);





function _causeLink(cause: Cause): string {
    return `/c/${cause.id}/${cause.slug}`;
}


ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={AppFrame}>
                <IndexRoute component={HomeView} />
                <Route path="c/:causeId/:causeSlug" component={CauseView} />

                <Route path="/" component={IdentityFrame}>
                    <Route path="admin" component={AdminFrame}>
		        <IndexRedirect to="my-cause" />
			<Route path="my-cause" component={AdminMyCauseView} />
			<Route path="cause-analytics" component={AdminCauseAnalyticsView} />
			<Route path="my-actions" component={AdminMyActionsView} />
			<Route path="account" component={AdminAccountView} />
                    </Route>
                </Route>
            </Route>
        </Router>
    </Provider>,
    document.getElementById('app')
);
