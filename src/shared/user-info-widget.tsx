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
	    return <p>{text.user[config.LANG()]((session.user as User).name)} <button onClick={this._handleLogoutClick.bind(this)}>{text.logout[config.LANG()]}</button></p>;
	} else {
	    return <p><button onClick={this._handleLoginClick.bind(this)}>{text.login[config.LANG()]}</button></p>;
	}
    }

    private _handleLogoutClick() {
        location.replace(config.LOGOUT_ROUTE);
    }

    private _handleLoginClick() {
        config.AUTH0_CLIENT().showLock(true);
    }
}