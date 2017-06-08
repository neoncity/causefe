import * as React from 'react'
import { connect } from 'react-redux'

import { Session, User } from '@neoncity/identity-sdk-js'

import { showAuth0Lock } from './auth0'
import { LANG } from './from-server'

import * as text from './user-info-widget.text'


interface Props {
    session: Session;
    logoutRoute: string;
}


export class _UserInfoWidget extends React.Component<Props, undefined> {
    render() {
	if (this.props.session.hasUser()) {
	    return <p>{text.user[LANG]((this.props.session.user as User).name)} <button onClick={this._handleLogoutClick.bind(this)}>{text.logout[LANG]}</button></p>;
	} else {
	    return <p><button onClick={this._handleLoginClick.bind(this)}>{text.login[LANG]}</button></p>;
	}
    }

    private _handleLogoutClick() {
        location.replace(this.props.logoutRoute);
    }

    private _handleLoginClick() {
	showAuth0Lock();
    }
}


function stateToProps(state: any) {
    return {
	session: state.request.session,
	logoutRoute: state.request.logoutRoute
    };
}


function dispatchToProps(_dispatch: (newState: any) => void) {
    return {}
}


export const UserInfoWidget = connect(stateToProps, dispatchToProps)(_UserInfoWidget);
