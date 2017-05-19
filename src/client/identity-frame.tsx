import * as React from 'react'
import { connect } from 'react-redux'

import { User } from '@neoncity/identity-sdk-js'

import { OpState } from './store'


interface Props {
    isInit: boolean;
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    user: User|null;
}


class _IdentityFrame extends React.Component<Props, undefined> {
    render() {
        if (!this.props.isReady) {
	    return <div>Logging in ...</div>;
	} else {
	    return <div>{this.props.children}</div>;
	}
    }
}


function stateToProps(state: any) {
    return {
        isInit: state.identity.type == OpState.Init,
        isLoading: state.identity.type == OpState.Loading,
        isReady: state.identity.type == OpState.Ready,
        isFailed: state.identity.type == OpState.Failed,
        user: state.identity.type == OpState.Ready ? state.identity.user : null
    };
}


function dispatchToProps() {
    return {};
}


export const IdentityFrame = connect(stateToProps, dispatchToProps)(_IdentityFrame);
