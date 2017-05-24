import * as React from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'

import { isLocal } from '@neoncity/common-js'
import { User } from '@neoncity/identity-sdk-js'

import { AUTH0_ACCESS_TOKEN } from './from-server'
import { showAuth0Lock } from './auth0'
import * as config from './config'
import { identityClient } from './services'
import { OpState, IdentityState, StatePart } from './store'
import { UserInfoWidget } from './user-info-widget'


interface Props {
    isInit: boolean;
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    user: User|null;
    onIdentityLoading: () => void;
    onIdentityReady: (user: User) => void;
    onIdentityFailed: (errorMessage: string) => void;
    children: React.ReactNode;
}


class _AppFrame extends React.Component<Props, undefined> {
    async componentDidMount() {
	if (AUTH0_ACCESS_TOKEN == 'INVALID') {
	    return;
	}
	
	this.props.onIdentityLoading();

	try {
	    const user = await identityClient.getOrCreateUser(AUTH0_ACCESS_TOKEN);
	    this.props.onIdentityReady(user);
	} catch (e) {
            if (isLocal(config.ENV)) {
                console.log(e);
            }

            const currentLocation = browserHistory.getCurrentLocation();
            
	    if ((currentLocation.pathname.indexOf('/admin') == 0) || (currentLocation.pathname.indexOf('/console') == 0)) {
		showAuth0Lock();
            }
	    
	    this.props.onIdentityFailed('Could not load user');
	}
    }
    
    render() {
	// Bit of a hack. If there's no user, the global navigation to admin and console is done through a regular <a> tag
	// which will trigger a page load event. This is not so bad, as the login flow is beefy as it is, but it does add
	// _some_ extra complexity. Hopefully it will be easy to get rid of in the future.
	// TODO: make this simpler / work through the single-page setup.
        if (!this.props.isReady) {
            return (
                <div>
                    <div>This is the app frame</div>
                    <div>
                        <Link to="/">Home</Link>
                        <a href="/admin">Admin</a>
                        <UserInfoWidget />
                    </div>
                    {this.props.children}
                </div>
            );
        } else {
            return (
                <div>
                    <div>This is the app frame</div>
                    <div>
                        <Link to="/">Home</Link>
                        <Link to="/admin">Admin</Link>
                        <UserInfoWidget />
                    </div>
                    {this.props.children}
                </div>
            );      
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


function dispatchToProps(dispatch: (newState: IdentityState) => void) {
    return {
	onIdentityLoading: () => dispatch({part: StatePart.Identity, type: OpState.Loading}),
	onIdentityReady: (user: User) => dispatch({part: StatePart.Identity, type: OpState.Ready, user: user}),
	onIdentityFailed: (errorMessage: string) => dispatch({part: StatePart.Identity, type: OpState.Failed, errorMessage: errorMessage})
    };
}


export const AppFrame = connect(stateToProps, dispatchToProps)(_AppFrame);
