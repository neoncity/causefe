import * as React from 'react'

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

        let lastPart = null;
        if (this.state.isLoading) {
            lastPart = <span>{commonText.loading[config.LANG()]}</span>;
        } else if (this.state.isFailed) {
            lastPart = <span>{commonText.loadingFailed[config.LANG()]}</span>;
        } else {
            lastPart =
                <button
                    className="action"
                    onClick={this._handleAgreeToCookiePolicyClick.bind(this)}>
                    {text.agree[config.LANG()]}
                </button>;
        }

        return (
            <div id="cookie-policy-widget">
                <div className="content">
                    <span>{text.weUseCookies[config.LANG()]}</span>
                    <span>{text.seeOur[config.LANG()]}</span>
                    <a href="/company/cookies">{text.cookies[config.LANG()]}</a>
                    {lastPart}
                </div>
            </div>
        );
    }

    private async _handleAgreeToCookiePolicyClick(): Promise<void> {
        this.setState({ isLoading: true });

        try {
            await config.IDENTITY_CLIENT().agreeToCookiePolicyForSession(config.SESSION());
            this.setState({ isReady: true, agreedToCookiePolicy: true });
        } catch (e) {
            console.log(e);
            config.ROLLBAR_CLIENT().error(e);

            this.setState({ isFailed: true });
        }
    }
}
