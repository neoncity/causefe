import * as React from 'react'

import { showAuth0Lock } from './auth0'
import { SESSION } from './from-server'


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
	    return <div>Should be logged in!</div>;
	} else {
	    return <div>{this.props.children}</div>;
	}
    }
}
