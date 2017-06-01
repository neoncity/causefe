import * as React from 'react'

import { showAuth0Lock } from './auth0'
import { LANG, SESSION } from './from-server'

import * as text from './identity-frame.text'


interface Props {
    children: React.ReactNode;
}


export class IdentityFrame extends React.Component<Props, undefined> {
    componentDidMount() {
	if (!SESSION.hasUser()) {
	    showAuth0Lock();
	}
    }
    
    render() {
        if (!SESSION.hasUser()) {
	    return <div>{text.shouldBeLoggedIn[LANG]}</div>;
	} else {
	    return <div>{this.props.children}</div>;
	}
    }
}
