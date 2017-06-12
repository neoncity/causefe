import * as React from 'react'
import { connect } from 'react-redux'

import * as config from './config'
import { Auth0Client } from '../shared/auth0'

import * as text from './identity-frame.text'


interface Props {
    auth0Client: Auth0Client;
    children: React.ReactNode;
}


class _IdentityFrame extends React.Component<Props, undefined> {
    componentDidMount() {
	if (!config.SESSION().hasUser()) {
            this.props.auth0Client.showLock(false);
	}
    }
    
    render() {
        if (!config.SESSION().hasUser()) {
	    return <div>{text.shouldBeLoggedIn[config.LANG()]}</div>;
	} else {
	    return <div>{this.props.children}</div>;
	}
    }
}


function stateToProps(state: any) {
    return {
        auth0Client: state.request.services.auth0Client
    };
}


function dispatchToProps(_: (newState: any) => void) {
    return {};
}


export const IdentityFrame = connect(stateToProps, dispatchToProps)(_IdentityFrame);
