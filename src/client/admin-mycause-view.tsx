import * as theMoment from 'moment'
import * as r from 'raynor'
import * as React from 'react'
import * as ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { connect } from 'react-redux'

import { Currency, StandardCurrencies, CurrencyMarshaller } from '@neoncity/common-js/currency'
import { isLocal } from '@neoncity/common-js/env'
import { slugify } from '@neoncity/common-js/slugify'
import { BankInfo,
	 CurrencyAmount,
	 PictureSet,
	 PrivateCause,
	 TitleMarshaller,
	 DescriptionMarshaller} from '@neoncity/core-sdk-js'

import { BankInfoWidget } from './bank-info-widget'
import * as config from './config'
import { ImageGalleryEditorWidget } from './image-gallery-editor-widget'
import './index.less'
import { corePrivateClient, fileStorageService } from './services'
import { AdminMyCauseState, OpState, StatePart } from './store'
import { UserInput, UserInputMaster } from './user-input'

const moment = require('moment')


interface Props {
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    hasCause: boolean;
    causeIsDeleted: boolean;
    cause: PrivateCause|null;
    errorMessage: string|null;
    onPrivateCauseLoading: () => void;
    onPrivateCauseReady: (hasCause: boolean, causeIsDeleted: boolean, cause: PrivateCause|null) => void;
    onPrivateCauseFailed: (errorMessage: string) => void;
}


interface State {
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


class _AdminMyCauseView extends React.Component<Props, State> {
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
    
    constructor(props: Props, context: any) {
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
            const privateCause = await corePrivateClient.getCause();
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

    componentWillReceiveProps(newProps: Props) {
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
                        <input
                            id="admin-my-cause-slug"
                            value={this.state.slug.getValue()}
                            disabled={true}
                            placeholder="URL..." />
                        {slugModifiedRegion} {slugWarningRegion}
                    </div>
                    <div>
                        <label htmlFor="admin-my-cause-description">Description</label>
                        <input
                            id="admin-my-cause-description"
                            type="text"
                            value={this.state.description.getUserInput()}
                            onChange={this._handleDescriptionChange.bind(this)}
                            placeholder="Cause description..." />
                        {descriptionModifiedRegion} {descriptionWarningRegion}
                    </div>
                    <div>
                        <label htmlFor="admin-my-cause-deadline">Deadline</label>
                        <ReactDatePicker
                            id="admin-my-cause-deadline"
                            selected={this.state.deadline}
                            onChange={this._handleDeadlineChange.bind(this)} />
                    </div>
                    <div>
                        <label htmlFor="admin-my-cause-goal-amount">Goal amount</label>
                        <input
                            id="admin-my-cause-goal-amount"
                            type="number"
                            value={this.state.goalAmount.getUserInput()}
                            onChange={this._handleGoalAmountChange.bind(this)} placeholder="100" />
                        {goalAmountModifiedRegion} {goalAmountWarningRegion}
                    </div>
                    <div>
                        <label htmlFor="admin-my-cause-goal-currency">Goal currency</label>
                        <select
                            id="admin-my-cause-goal-currency"
                            value={this.state.goalCurrency.getUserInput()}
                            onChange={this._handleGoalCurrencyChange.bind(this)}>
                            <option value="RON">RON</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                        {goalCurrencyModifiedRegion} {goalCurrencyWarningRegion}
                    </div>
                    <div>
                        <BankInfoWidget
                            bankInfo={this.state.bankInfo}
                            onBankInfoChange={this._handleBankInfoChange.bind(this)} />
                        <ImageGalleryEditorWidget
                            pictureSet={this.state.pictureSet}
                            selectPicture={pos => fileStorageService.selectImageWithWidget(pos)}
                            onPictureSetChange={this._handlePictureSetChange.bind(this)} />
                    </div>
                </form>
            </div>
        );
	
	if (this.props.isLoading) {
	    return <div>Loading ...</div>;
	} else if (this.props.isFailed) {
	    return <div>Failed {this.props.errorMessage}</div>;
	} else if (!this.props.hasCause) {
	    if (!this.state.showCreationFormIfNoControls) {
		return <div>There is no cause <button onClick={this._handleShowCreationForm.bind(this)}>Create cause</button> </div>;
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

    private _fullStateFromProps(props: Props): State {
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
	    await corePrivateClient.deleteCause();
	    this.props.onPrivateCauseReady(true, true, null);
	} catch (e) {
	    if (isLocal(config.ENV)) {
                console.log(e);
            }
            
	    this.props.onPrivateCauseFailed('Could not delete cause for user');
	}	
    }
}


function stateToProps(state: any) {
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


function dispatchToProps(dispatch: (newState: AdminMyCauseState) => void) {
    return {
	onPrivateCauseLoading: () => dispatch({part: StatePart.AdminMyCause, type: OpState.Loading}),
	onPrivateCauseReady: (hasCause: boolean, causeIsDeleted: boolean, cause: PrivateCause) => dispatch({part: StatePart.AdminMyCause, type: OpState.Ready, hasCause, causeIsDeleted, cause}),
	onPrivateCauseFailed: (errorMessage: string) => dispatch({part: StatePart.AdminMyCause, type: OpState.Failed, errorMessage: errorMessage})
    };
}


export const AdminMyCauseView = connect(stateToProps, dispatchToProps)(_AdminMyCauseView);
