import * as React from 'react'
import { Link } from 'react-router'
import * as r from 'raynor'

import { isLocal } from '@neoncity/common-js'
import { CurrencyAmount, PublicCause } from '@neoncity/core-sdk-js'

import * as config from './config'
import { LANG } from './from-server'
import { ImageGalleryWidget } from './image-gallery-widget'
import { corePublicClient } from './services'
import { OpState } from './store'
import { UserInput, UserInputMaster } from './user-input'
import { causeLink } from './utils'

import * as text from './public-cause-widget.text'


interface Props {
    cause: PublicCause;
}

interface State {
    donationAmount: UserInput<number, number>;
    donationState: OpState;
    shareState: OpState;
}


export class PublicCauseWidget extends React.Component<Props, State> {
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
        
        let donationResult = <span></span>;
        switch (this.state.donationState) {
        case OpState.Loading:
            donationResult = <span>{this.donating[LANG]}</span>;
            break;
        case OpState.Ready:
            donationResult = <span>{this.ready[LANG]}</span>;
            break;
        case OpState.Failed:
            donationResult = <span>{this.failed[LANG]}</span>;
            break;
        } 
        
        let shareResult = <span></span>;
        switch (this.state.shareState) {
        case OpState.Loading:
            shareResult = <span>{this.sharing[LANG]}</span>;
            break;
        case OpState.Ready:
            shareResult = <span>{this.ready[LANG]}</span>;
            break;
        case OpState.Failed:
            shareResult = <span>{this.failed[LANG]}</span>;
            break;
        }
        
	return (
            <div>
	        <h2><Link to={causeLink(this.props.cause)}>{this.props.cause.title}</Link></h2>
		<p>{this.props.cause.description}</p>
		<p>{this.props.cause.goal.amount} - {this.props.cause.goal.currency.toString()}</p>
		<p>{this.props.cause.deadline.toString()}</p>
                <ImageGalleryWidget pictureSet={this.props.cause.pictureSet} />
                <button
		    type="button"
		    onClick={_ => this._handleSetDonationAmount(10)}>
		    10
		</button>
                <button
		    type="button"
		    onClick={_ => this._handleSetDonationAmount(25)}>
		    25
		</button>
                <button
		    type="button"
		    onClick={_ => this._handleSetDonationAmount(50)}>
		    50
		</button>
                <span>{this.state.donationAmount.getValue()} - {this.props.cause.goal.currency.toString()}</span>
                <button
		    type="button" 
		    disabled={!allValid}
		    onClick={this._handleDonate.bind(this)}>
                    {text.donate[LANG]}
		</button>
                {donationResult}
                <button
		    type="button"
		    onClick={this._handleShare.bind(this)}>
                    {text.share[LANG]}
		</button>
                {shareResult}
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
            
            await corePublicClient.createDonation(this.props.cause.id, currencyAmount);
            this.setState({donationState: OpState.Ready});
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
                await corePublicClient.createShare(this.props.cause.id, response.post_id as string);
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
