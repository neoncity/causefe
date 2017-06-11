import * as React from 'react'
import { connect } from 'react-redux'

import { Session, User } from '@neoncity/identity-sdk-js'

import * as config from './config'
import { Auth0Client } from '../shared/auth0'

import * as text from './user-info-widget.text'


interface Props {
    session: Session;
    auth0Client: Auth0Client;
}


export class _UserInfoWidget extends React.Component<Props, undefined> {
    render() {
	if (this.props.session.hasUser()) {
	    return <p>{text.user[config.LANG()]((this.props.session.user as User).name)} <button onClick={this._handleLogoutClick.bind(this)}>{text.logout[config.LANG()]}</button></p>;
	} else {
	    return <p><button onClick={this._handleLoginClick.bind(this)}>{text.login[config.LANG()]}</button></p>;
	}
    }

    private _handleLogoutClick() {
        location.replace(config.LOGOUT_ROUTE);
    }

    private _handleLoginClick() {
        this.props.auth0Client.showLock(true);
    }
}


function stateToProps(state: any) {
    return {
	session: state.request.session,
        auth0Client: state.request.services != null ? state.request.services.auth0Client : null
    };
}


function dispatchToProps(_dispatch: (newState: any) => void) {
    return {}
}


export const UserInfoWidget = connect(stateToProps, dispatchToProps)(_UserInfoWidget);
