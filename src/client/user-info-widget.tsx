import * as React from 'react'

import { User } from '@neoncity/identity-sdk-js'

import { SESSION } from './from-server'
import { showAuth0Lock } from './auth0'


interface Props {
}


export class UserInfoWidget extends React.Component<Props, undefined> {
    render() {
	if (SESSION.hasUser()) {
	    return <p>User: {(SESSION.user as User).name} <button onClick={this._handleLogoutClick.bind(this)}>Logout</button></p>;
	} else {
	    return <p><button onClick={this._handleLoginClick.bind(this)}>Login</button></p>;	    
	}
    }

    private _handleLogoutClick() {
        location.replace('/real/logout');
    }

    private _handleLoginClick() {
	showAuth0Lock();
    }
}
