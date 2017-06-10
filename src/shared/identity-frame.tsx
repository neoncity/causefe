import * as React from 'react'
import { connect } from 'react-redux'

import { Session } from '@neoncity/identity-sdk-js'

import * as config from './config'
import { Auth0Client } from '../shared/auth0'

import * as text from './identity-frame.text'


interface Props {
    session: Session;
    auth0Client: Auth0Client;
    children: React.ReactNode;
}


class _IdentityFrame extends React.Component<Props, undefined> {
    componentDidMount() {
	if (!this.props.session.hasUser()) {
            this.props.auth0Client.showLock(false);
	}
    }
    
    render() {
        if (!this.props.session.hasUser()) {
	    return <div>{text.shouldBeLoggedIn[config.LANG]}</div>;
	} else {
	    return <div>{this.props.children}</div>;
	}
    }
}


function stateToProps(state: any) {
    return {
	session: state.request.session,
        auth0Client: state.request.services.auth0Client
    };
}


function dispatchToProps(_: (newState: any) => void) {
    return {};
}


export const IdentityFrame = connect(stateToProps, dispatchToProps)(_IdentityFrame);
