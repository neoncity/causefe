import * as theMoment from 'moment'
import * as r from 'raynor'
import * as React from 'react'
import * as ReactDatePicker from 'react-datepicker'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'

import { Currency, StandardCurrencies, CurrencyMarshaller } from '@neoncity/common-js'
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
import { AdminMyCauseState, OpState, StatePart } from '../shared/store'
import { UserInput, UserInputMaster } from './user-input'

import * as text from './admin-mycause-view.text'
import * as commonText from './common.text'

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
	deadline: moment().add(60, 'days'),
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
            const privateCause = await config.CORE_PRIVATE_CLIENT().getCause();
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
        const helmet =
            <Helmet>
                <title>{text.pageTitle[config.LANG()]}</title>
                <meta name="robots" content="noindex,nofollow" />
             </Helmet>;
        
	const allValid = !(this.state.title.isInvalid()
			   || this.state.slug.isInvalid()
			   || this.state.description.isInvalid()
			   || this.state.goalAmount.isInvalid()
			   || this.state.goalCurrency.isInvalid());

        let titleModifiersRegion = <span></span>;
        if (this.state.title.isInvalid()) {
            titleModifiersRegion = <span className="modifiers warning">{text.invalidTitleValue[config.LANG()]}</span>;
        } else if (this.state.title.isModified()) {
            titleModifiersRegion = <span className="modifiers modified">{text.modified[config.LANG()]}</span>;
        } else if (!this.props.hasCause) {
            titleModifiersRegion = <span className="modifiers mandatory">{text.mandatory[config.LANG()]}</span>;
        }

        let slugModifiersRegion = <span></span>;
        if (this.state.slug.isInvalid()) {
            slugModifiersRegion = <span className="modifiers warning">{text.invalidSlugValue[config.LANG()]}</span>;
        } else if (this.state.slug.isModified()) {
            slugModifiersRegion = <span className="modifiers modified">{text.modified[config.LANG()]}</span>;
        }

        let descriptionModifiersRegion = <span></span>;
        if (this.state.description.isInvalid()) {
            descriptionModifiersRegion = <span className="modifiers no-padding warning">{text.invalidDescriptionValue[config.LANG()]}</span>;
        } else if (this.state.description.isModified()) {
            descriptionModifiersRegion = <span className="modifiers no-padding modified">{text.modified[config.LANG()]}</span>;
        } else if (!this.props.hasCause) {
            descriptionModifiersRegion = <span className="modifiers mandatory">{text.mandatory[config.LANG()]}</span>;
        }

        let deadlineModifiersRegion = <span></span>;
        if (!this.props.hasCause) {
            deadlineModifiersRegion = <span className="modifiers mandatory">{text.mandatory[config.LANG()]}</span>;
        }
        
        let goalAmountModifiersRegion = <span></span>;
        if (this.state.goalAmount.isInvalid()) {
            goalAmountModifiersRegion = <span className="modifiers warning">{text.invalidGoalAmountValue[config.LANG()]}</span>;
        } else if (this.state.goalAmount.isModified()) {
            goalAmountModifiersRegion = <span className="modifiers modified">{text.modified[config.LANG()]}</span>;
        } else if (!this.props.hasCause) {
            goalAmountModifiersRegion = <span className="modifiers mandatory">{text.mandatory[config.LANG()]}</span>;
        }

        let goalCurrencyModifiersRegion = <span></span>;
        if (this.state.goalCurrency.isInvalid()) {
            goalCurrencyModifiersRegion = <span className="modifiers warning">{text.invalidGoalCurrencyValue[config.LANG()]}</span>;
        } else if (this.state.goalCurrency.isModified()) {
            goalCurrencyModifiersRegion = <span className="modifiers modified">{text.modified[config.LANG()]}</span>;
        } else if (!this.props.hasCause) {
            goalCurrencyModifiersRegion = <span className="modifiers mandatory">{text.mandatory[config.LANG()]}</span>;
        }
	
        const editForm = (
            <form className="edit-form">
                <div className="form-line">
                    <div className="form-line-info">
                        <label htmlFor="admin-mycause-title">{text.title[config.LANG()]}</label>
                        {titleModifiersRegion}
                    </div>
                    <div>
                        <input
                            id="admin-mycause-title"
                            type="text"
                            value={this.state.title.getUserInput()}
                            onChange={this._handleTitleChange.bind(this)}
                            placeholder={text.causeTitlePlaceholder[config.LANG()]} />
                    </div>
                </div>
                <div className="form-line">
                    <div className="form-line-info">
                        <label htmlFor="admin-mycause-slug">{text.url[config.LANG()]}</label>
                        {slugModifiersRegion}
                    </div>
                    <input
                        id="admin-mycause-slug"
                        value={this.state.slug.getValue()}
                        disabled={true}
                        placeholder={text.causeUrlPlaceholder[config.LANG()]} />
                </div>
                <div className="form-line">
                    <div className="form-line-info">
                        <label htmlFor="admin-mycause-description">{text.description[config.LANG()]}</label>
                        {descriptionModifiersRegion}
                    </div>
                    <textarea
                        id="admin-mycause-description"
                        value={this.state.description.getUserInput()}
                        onChange={this._handleDescriptionChange.bind(this)}
                        placeholder={text.causeDescriptionPlaceholder[config.LANG()]} />
                </div>
                <div className="form-line">
                    <div className="form-line-info">
                        <label htmlFor="admin-mycause-deadline">{text.deadline[config.LANG()]}</label>
                        {deadlineModifiersRegion}
                    </div>
                    <ReactDatePicker
                        id="admin-mycause-deadline"
                        selected={this.state.deadline}
                        onChange={this._handleDeadlineChange.bind(this)} />
                </div>
                <div className="form-line">
                    <div className="form-line-info">
                        <label htmlFor="admin-mycause-goal-amount">{text.goalAmount[config.LANG()]}</label>
                        {goalAmountModifiersRegion}
                    </div>
                    <input
                        id="admin-mycause-goal-amount"
                        type="number"
                        value={this.state.goalAmount.getUserInput()}
                        onChange={this._handleGoalAmountChange.bind(this)} placeholder="100" />
                </div>
                <div className="form-line">
                    <div className="form-line-info">
                        <label htmlFor="admin-mycause-goal-currency">{text.goalCurrency[config.LANG()]}</label>
                        {goalCurrencyModifiersRegion}
                    </div>
                    <select
                        id="admin-mycause-goal-currency"
                        value={this.state.goalCurrency.getUserInput()}
                        onChange={this._handleGoalCurrencyChange.bind(this)}>
                        <option value="RON">RON</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>
                <div className="form-line">
                    <BankInfoWidget
                        bankInfo={this.state.bankInfo}
                        onBankInfoChange={this._handleBankInfoChange.bind(this)} />
                    <ImageGalleryEditorWidget
                        pictureSet={this.state.pictureSet}
                        selectPicture={pos => config.FILE_STORAGE_CLIENT().selectImageWithWidget(pos)}
                        onPictureSetChange={this._handlePictureSetChange.bind(this)} />
                </div>
            </form>
        );
	
	if (this.props.isLoading) {
	    return (
		<div className="loading">
		   {helmet}
                   <span className="message">{commonText.loading[config.LANG()]}</span>
	        </div>
	    );
	} else if (this.props.isFailed) {
	    return (
                <div className="failed">
                    {helmet}
                    <span className="message">{commonText.loadingFailed[config.LANG()]}</span>
                </div>
	    );
	} else if (!this.props.hasCause) {
	    if (!this.state.showCreationFormIfNoControls) {
		return (
                    <div id="admin-mycause-view">
                        {helmet}
                        <p className="no-cause">
                            {text.noCause[config.LANG()]}
                        </p>
                        <p className="no-cause">
                            <button
                                className="action"
                                onClick={this._handleShowCreationForm.bind(this)}>
                            {text.createCause[config.LANG()]}
                            </button>
                        </p>
                    </div>
                );
	    } else {
		return (
                    <div id="admin-mycause-view">
                        {helmet}
                        {editForm}
                        <div className="create-controls">
                            <button
                                className="action"
                                disabled={!this.state.modifiedGeneral}
                                onClick={this._handleResetGeneral.bind(this)}>
                                {text.reset[config.LANG()]}
                            </button>
                            <button
                                className="action"
                                disabled={!this.state.modifiedGeneral || !allValid}
                                onClick={this._handleCreate.bind(this)}>
                                {text.create[config.LANG()]}
                            </button>
                        </div>
                    </div>
		);
            }
	} else if (this.props.causeIsDeleted) {
	    return <div>{helmet}{text.causeDeleted[config.LANG()]}</div>;
        } else {
            // const cause = this.props.cause as PrivateCause;
            
            return (
                <div id="admin-mycause-view">
                    {helmet}
                    {editForm}
                    <div className="update-controls">
                         <button
                             className="action"
                             disabled={!this.state.modifiedGeneral}
                             onClick={this._handleResetGeneral.bind(this)}>
                             {text.reset[config.LANG()]}
                         </button>
                         <button
                             className="action"
                             disabled={!this.state.modifiedGeneral || !allValid}
                             onClick={this._handleUpdate.bind(this)}>
                             {text.update[config.LANG()]}
                         </button>
                    </div>
		    <div className="delete-controls">
                        <button
                            className="action"
                            onClick={this._handleDelete.bind(this)}>
                            <span className="warning-icon" />
                            <span className="text">{text.deleteCause[config.LANG()]}</span>
                        </button>
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
	    
	    const privateCause = await config.CORE_PRIVATE_CLIENT().createCause(
                config.SESSION(),
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
	    
	    const privateCause = await config.CORE_PRIVATE_CLIENT().updateCause(
                config.SESSION(),
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
	    await config.CORE_PRIVATE_CLIENT().deleteCause(config.SESSION());
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
