import Auth0Lock from 'auth0-lock'
import * as queryString from 'query-string'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router'

import * as m from '@neoncity/common-js/marshall'
import { MarshalFrom, MarshalWith } from '@neoncity/common-js/marshall'
import { AuthInfo, IdentityResponse, IdentityService } from '@neoncity/identity-sdk-js'

import * as config from './config'
import './index.less'
import { store } from './store'


// Start services here. Will move to a better place later.

// Generate in a better way. Perhaps something something HMAC to make sure it's one of ours.
class PostLoginInfo {
    @MarshalWith(m.StringMarshaller)
    path: string;

    constructor(path: string) {
        this.path = path;
    }
}

const authInfoMarshaller = new (MarshalFrom(AuthInfo))();
const identityResponseMarshaller = new (MarshalFrom(IdentityResponse))();
const postLoginInfoMarshaller = new (MarshalFrom(PostLoginInfo))();

const accessToken: string|null = _loadAccessToken();
let identityService: IdentityService|null;

const currentLocation = browserHistory.getCurrentLocation();

const postLoginInfo = new PostLoginInfo(currentLocation.pathname);
const postLoginInfoSer = encodeURIComponent(JSON.stringify(postLoginInfoMarshaller.pack(postLoginInfo)));

const auth0: Auth0LockStatic = new Auth0Lock(
    config.AUTH0_CLIENT_ID,
    config.AUTH0_DOMAIN, {
        closable: false,
        auth: {
            redirect: true,
            redirectUrl: config.AUTH0_CALLBACK_URI,
            responseType: 'token',
            params: {
                state: postLoginInfoSer
            }
        }
    }
);

if (accessToken != null) {
    identityService = new IdentityService(
        accessToken,
	config.IDENTITY_SERVICE_HOST,
	authInfoMarshaller,
	identityResponseMarshaller);
} else if (currentLocation.pathname == '/real/login') {
    const queryParsed = queryString.parse((currentLocation as any).hash);
    _saveAccessToken(queryParsed['access_token'] as string);

    identityService = new IdentityService(
        queryParsed['access_token'] as string,
	config.IDENTITY_SERVICE_HOST,
	authInfoMarshaller,
	identityResponseMarshaller);

    const postLoginInfo = postLoginInfoMarshaller.extract(JSON.parse(decodeURIComponent(queryParsed['state'] as string)));
    browserHistory.push(postLoginInfo.path);
} else if ((currentLocation.pathname.indexOf('/admin') == 0) || (currentLocation.pathname.indexOf('/console') == 0)) {
    auth0.show();
} else {
    identityService = null;
}


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
}


class IdentityFrame extends React.Component<IdentityFrameProps, undefined> {
    componentDidMount() {
        if (identityService == null) {
            auth0.show();
        }
    }
    
    render() {
        if (identityService != null) {
            return (<div>{this.props.children}</div>);
        } else {
            return (<div>Should be logged in</div>);
        }
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
                <IndexRoute component={HomeView} />
                <Route path="c/:causeSlug" component={CauseView} />

                <Route path="/" component={IdentityFrame}>
                    <Route path="admin" component={AdminView} />
                    <Route path="console" component={ConsoleView} />
                </Route>
            </Route>
        </Router>
    </Provider>,
    document.getElementById('app')
);
