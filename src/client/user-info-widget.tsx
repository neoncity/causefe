import * as React from 'react'
import { connect } from 'react-redux'

import { User } from '@neoncity/identity-sdk-js'

import { showAuth0Lock } from './auth0'
import { OpState } from './store'


interface Props {
    isInit: boolean;
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    user: User|null;
}


class _UserInfoWidget extends React.Component<Props, undefined> {
    render() {
        if (this.props.isLoading) {
            return <p>Loading user</p>;
        } else if (this.props.isReady) {
            return <p>User: {(this.props.user as User).name} <button onClick={this._handleLogoutClick.bind(this)}>Logout</button></p>;
        } else /* if (this.props.isFailed || this.props.isInit) */ {
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


export const UserInfoWidget = connect(stateToProps, dispatchToProps)(_UserInfoWidget);
