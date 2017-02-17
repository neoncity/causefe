import Auth0Lock from 'auth0-lock'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router'

import { MarshalFrom } from '@neoncity/common-js/marshall'
import { AuthInfo, IdentityResponse, IdentityService } from '@neoncity/identity-sdk-js'

import * as config from './config'
import './index.less'
import { store } from './store'


// Start services here. Will move to a better place later.



const accessToken: string|null = _loadAccessToken();

if (accessToken == null) {
    const auth0: Auth0LockStatic = new Auth0Lock(
        config.AUTH0_CLIENT_ID,
        config.AUTH0_DOMAIN
    );

    auth0.on('authenticated', (authResult) => {
        auth0.getUserInfo(authResult.accessToken, (error, _) => {
	    if (error) {
	        console.log(error);
            }

	    _saveAccessToken(authResult.accessToken);
	});
    });

    auth0.show();
}

const authInfoMarshaller = new (MarshalFrom(AuthInfo))();
const identityResponseMarshaller = new (MarshalFrom(IdentityResponse))();

const identityService: IdentityService|null =
    accessToken != null
    ? new IdentityService(
         accessToken,
	 config.IDENTITY_SERVICE_HOST,
	 authInfoMarshaller,
	 identityResponseMarshaller)
    : null;



function _saveAccessToken(accessToken: string) {
    localStorage.setItem('neoncity/access_token', accessToken);
}

function _loadAccessToken(): string|null {
    return localStorage.getItem('neoncity/access_token');
}

interface AppFrameProps {
    children: React.ReactNode;
}


class AppFrame extends React.Component<AppFrameProps, undefined> {
    render() {
        return (
	    <div>
		<div>This is the app frame</div>
		<div>
		  <Link to="/">Home</Link>
		  <Link to="/c/cause-1">Cause 1</Link>
		  <Link to="/c/cause-2">Cause 2</Link>
		  <Link to="/admin">Admin</Link>
		  <Link to="/console">Console</Link>
		</div>
		{this.props.children}
            </div>
        );
    }
}


interface IdentityFrameProps {
    required: boolean;
}


class IdentityFrame extends React.Component<IdentityFrameProps, undefined> {
    componentDidMount() {
        if (identityService == null &&  !this.props.required) {
	    // Mark the state as such
	} else if (identityService == null && this.props.required) {
	    // Go to login
	} else {
	    // Retrieve the user
	}
    }
    
    render() {
        return (<div>{this.props.children}</div>);
    }
}


interface HomeViewParams {
    causeSlug: string;
}


interface HomeViewProps {
    params: HomeViewParams;
}


class HomeView extends React.Component<HomeViewProps, undefined> {
    render() {
        return (
	    <div>This is the home view</div>
	);
    }
}


interface CauseViewProps {
    params: any
}


class CauseView extends React.Component<CauseViewProps, undefined> {
    render() {
        return (
	    <div>This is the cause view for {this.props.params.causeSlug}</div>
	);
    }
}


interface AdminViewProps {
}


class AdminView extends React.Component<AdminViewProps, undefined> {
    render() {
        return (
	    <div>This is the admin view</div>
        );
    }
}


interface ConsoleViewProps {
}


class ConsoleView extends React.Component<ConsoleViewProps, undefined> {
    render() {
        return (
	    <div>This is the console view</div>
	);
    }
}


ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={AppFrame}>
                <Route path="/" component={() => (<IdentityFrame required={false} />)}>
                    <IndexRoute component={HomeView} />
                    <Route path="c/:causeSlug" component={CauseView} />
                </Route>

                <Route path="/" component={() => (<IdentityFrame required={true} />)}>
                    <Route path="admin" component={AdminView} />
                    <Route path="console" component={ConsoleView} />
                </Route>
            </Route>
        </Router>
    </Provider>,
    document.getElementById('app')
);
