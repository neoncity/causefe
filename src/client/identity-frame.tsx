import * as React from 'react'
import { connect } from 'react-redux'

import { Session } from '@neoncity/identity-sdk-js'

import { showAuth0Lock } from './auth0'
import * as config from './config'

import * as text from './identity-frame.text'


interface Props {
    session: Session;
    children: React.ReactNode;
}


class _IdentityFrame extends React.Component<Props, undefined> {
    componentDidMount() {
	if (!this.props.session.hasUser()) {
	    showAuth0Lock();
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
    };
}


function dispatchToProps(_: (newState: any) => void) {
    return {};
}


export const IdentityFrame = connect(stateToProps, dispatchToProps)(_IdentityFrame);
