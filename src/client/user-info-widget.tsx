import * as React from 'react'

import { User } from '@neoncity/identity-sdk-js'

import { showAuth0Lock } from './auth0'
import * as config from './config'
import { LANG, SESSION } from './from-server'

import * as text from './user-info-widget.text'


interface Props {
}


export class UserInfoWidget extends React.Component<Props, undefined> {
    render() {
	if (SESSION.hasUser()) {
	    return <p>{text.user[LANG]((SESSION.user as User).name)} <button onClick={this._handleLogoutClick.bind(this)}>{text.logout[LANG]}</button></p>;
	} else {
	    return <p><button onClick={this._handleLoginClick.bind(this)}>{text.login[LANG]}</button></p>;
	}
    }

    private _handleLogoutClick() {
        location.replace(config.LOGOUT_ROUTE);
    }

    private _handleLoginClick() {
	showAuth0Lock();
    }
}
