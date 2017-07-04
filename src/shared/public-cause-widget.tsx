import * as classNames from 'classnames'
import * as React from 'react'
import { Link } from 'react-router'
import * as r from 'raynor'

import { isLocal } from '@neoncity/common-js'
import { CurrencyAmount, PublicCause } from '@neoncity/core-sdk-js'

import * as config from './config'
import { OpState } from '../shared/store'
import { UserInput, UserInputMaster } from './user-input'
import { causeLink, causePictureUri } from './utils'

import * as text from './public-cause-widget.text'

const moment = require('moment')


interface Props {
    cause: PublicCause;
}

interface State {
    donationAmount: UserInput<number, number>;
    donationState: OpState;
    shareState: OpState;
}


export class PublicCauseWidget extends React.Component<Props, State> {
    private static readonly _ACTION_RESET_TIMEOUT: number = 1000;
    
    private static readonly _initialState: State = {
        donationAmount: new UserInput<number, number>(10, 10),
        donationState: OpState.Init,
        shareState: OpState.Init
    };

    private readonly _donationAmountMaster: UserInputMaster<number, number>;
    
    constructor(props: Props, context: any) {
        super(props, context);
        this.state = (Object as any).assign({}, PublicCauseWidget._initialState);
	this._donationAmountMaster = new UserInputMaster<number, number>(new r.PositiveIntegerMarshaller());
    }
    
    render() {
        const allValid = !this.state.donationAmount.isInvalid();
        
        let donationSegment = <span></span>;
        switch (this.state.donationState) {
        case OpState.Init:
            donationSegment =
                <button
                    className="action donate"
                    type="button" 
                    disabled={!allValid}
                    onClick={this._handleDonate.bind(this)}>
		    <span className="icon" />
                    <span className="text">{text.donate[config.LANG()]}</span>
                </button>;
            break;
        case OpState.Loading:
            donationSegment = <span className="action-status">{text.donating[config.LANG()]}</span>;
            break;
        case OpState.Ready:
            donationSegment = <span className="action-status">{text.donated[config.LANG()]}</span>;
            break;
        case OpState.Failed:
            donationSegment = <span className="action-status">{text.failed[config.LANG()]}</span>;
            break;
        } 
        
        let shareSegment = <span></span>;
        switch (this.state.shareState) {
        case OpState.Init:
            shareSegment =
                <button
                    className="action share"
                    type="button"
                    onClick={this._handleShare.bind(this)}>
		    <span className="icon" />
                    <span className="text">{text.share[config.LANG()]}</span>
                </button>;
            break;
        case OpState.Loading:
            shareSegment = <span className="action-status">{text.sharing[config.LANG()]}</span>;
            break;
        case OpState.Ready:
            shareSegment = <span className="action-status">{text.shared[config.LANG()]}</span>;
            break;
        case OpState.Failed:
            shareSegment = <span className="action-status">{text.failed[config.LANG()]}</span>;
            break;
        }

        const daysLeft = moment().diff(moment(this.props.cause.deadline), 'days');
        const percentageRaised = 0.5;
        
	return (
            <div className="public-cause-widget">
		<img
		    className="cause-picture"
		    src={causePictureUri(this.props.cause)}
	            alt={text.causePicture[config.LANG()]} />

                <div className="content">
                    <h2 className="title">
                        <Link to={causeLink(this.props.cause)}>{this.props.cause.title}</Link>
                    </h2>
                
                    <p className="description">{this.props.cause.description}</p>
                    
                    <p className="status">
                        <span>{text.infoOnRaised[config.LANG()](percentageRaised, this.props.cause.goal.amount, this.props.cause.goal.currency)}</span>
                        <span>{text.daysLeft[config.LANG()](daysLeft)}</span>
                    </p>

                    <p className="donation-amount-select">
                        <button
                            className={classNames('action', {'selected': this.state.donationAmount.getValue() == 10})}
                            type="button"
                            onClick={_ => this._handleSetDonationAmount(10)}>
                            10 {this.props.cause.goal.currency.toString()}
                        </button>
                        <button
                            className={classNames('action', {'selected': this.state.donationAmount.getValue() == 25})}
                            type="button"
                            onClick={_ => this._handleSetDonationAmount(25)}>
                            25 {this.props.cause.goal.currency.toString()}
                        </button>
                        <button
                            className={classNames('action', {'selected': this.state.donationAmount.getValue() == 50})}
                            type="button"
                            onClick={_ => this._handleSetDonationAmount(50)}>
                            50 {this.props.cause.goal.currency.toString()}
                        </button>
                    </p>

                    <p className="donate-and-share">
                        {donationSegment}
                        {shareSegment}
                    </p>
                </div>
	    </div>
	);
    }

    private _handleSetDonationAmount(amount: number) {
        this.setState({donationAmount: this._donationAmountMaster.transform(amount, this.state.donationAmount.getValue())});
    }

    private async _handleDonate() {
        this.setState({donationState: OpState.Loading});
        
        try {
            const currencyAmount = new CurrencyAmount();
            currencyAmount.amount = this.state.donationAmount.getValue();
            currencyAmount.currency = this.props.cause.goal.currency;
            
            await config.CORE_PUBLIC_CLIENT().createDonation(config.SESSION(), this.props.cause.id, currencyAmount);
            this.setState({donationState: OpState.Ready});
            setInterval(() => this.setState({donationState: OpState.Init}), PublicCauseWidget._ACTION_RESET_TIMEOUT);
        } catch (e) {
            if (isLocal(config.ENV)) {
                console.log(e);
            }
            
            this.setState({donationState: OpState.Failed});
        }
    }

    private _handleShare() {
        const href = `${window.location.protocol}//${window.location.hostname}:${window.location.port}${causeLink(this.props.cause)}`;

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
                await config.CORE_PUBLIC_CLIENT().createShare(config.SESSION(), this.props.cause.id, response.post_id as string);
                this.setState({shareState: OpState.Ready});
                setInterval(() => this.setState({donationState: OpState.Init}), PublicCauseWidget._ACTION_RESET_TIMEOUT);
            } catch (e) {
                if (isLocal(config.ENV)) {
                    console.log(e);
                }
                
                this.setState({shareState: OpState.Failed});
            }
        });
    }
}
