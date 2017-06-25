import * as React from 'react'

import { isLocal } from '@neoncity/common-js/env'

import * as config from './config'

import * as commonText from './common.text'
import * as text from './cookie-policy-widget.text'


interface Props {
}


interface State {
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    agreedToCookiePolicy: boolean;
}


export class CookiePolicyWidget extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: false,
            isReady: true,
            isFailed: false,
            agreedToCookiePolicy: config.SESSION().agreedToCookiePolicy
        }
    }
    
    render() {
        if (this.state.agreedToCookiePolicy) {
            return <div></div>;
        }

        if (this.state.isLoading) {
            return <div>{text.weUseCookies[config.LANG()]} {text.seeOur[config.LANG()]} <a href="/company/privacy">{text.privacy[config.LANG()]}</a> {commonText.loading[config.LANG()]}</div>;
        } else if (this.state.isFailed) {
            return <div>{text.weUseCookies[config.LANG()]} {text.seeOur[config.LANG()]} <a href="/company/privacy">{text.privacy[config.LANG()]}</a> {commonText.loadingFailed[config.LANG()]}</div>;
        } else {
            return <div>{text.weUseCookies[config.LANG()]} {text.seeOur[config.LANG()]} <a href="/company/privacy">{text.privacy[config.LANG()]}</a> <button onClick={this._handleAgreeToCookiePolicyClick.bind(this)}>{text.agree[config.LANG()]}</button></div>;
        }
    }

    private async _handleAgreeToCookiePolicyClick(): Promise<void> {
        this.setState({isLoading: true});

        try {
            await config.IDENTITY_CLIENT().agreeToCookiePolicyForSession(config.SESSION());
            this.setState({isReady: true, agreedToCookiePolicy: true});
        } catch (e) {
            if (isLocal(config.ENV)) {
                console.log(e);
            }

            this.setState({isFailed: true});
        }
    }
}
