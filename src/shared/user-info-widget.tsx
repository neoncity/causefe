import * as React from 'react'

import { User } from '@neoncity/identity-sdk-js'

import * as config from './config'

import * as text from './user-info-widget.text'


interface Props {
}


export class UserInfoWidget extends React.Component<Props, undefined> {
    render() {
        const session = config.SESSION();
	if (session.hasUser()) {
	    return (
                <div>
		    <img
		        className="profile-picture"
		        src={(session.user as User).pictureUri}
		        alt={text.pictureOf[config.LANG()]((session.user as User).name)} />
                    <button
		        className="action"
		        onClick={this._handleLogoutClick.bind(this)}>
		        {text.logout[config.LANG()]}
		    </button>
                </div>
            );
	} else {
	    return (
                <div>
                    <a
                        href="#"
                        className="auth-button"
                        onClick={this._handleLoginClick.bind(this)}>
                        {text.login[config.LANG()]}
                    </a>
                    <a
                        href="#"
                        className="auth-button"
                        onClick={this._handleLoginClick.bind(this)}>
                        {text.signup[config.LANG()]}
                    </a>
                </div>
            );
	}
    }

    private _handleLogoutClick() {
        location.replace(config.LOGOUT_ROUTE);
    }

    private _handleLoginClick() {
        config.AUTH0_CLIENT().showLock(true);
    }
}
