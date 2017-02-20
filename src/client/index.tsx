import Auth0Lock from 'auth0-lock'
import * as queryString from 'query-string'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router'

import * as m from '@neoncity/common-js/marshall'
import { ExtractError, MarshalFrom, MarshalWith } from '@neoncity/common-js/marshall'
import { Auth0AccessTokenMarshaller, IdentityService, newIdentityService } from '@neoncity/identity-sdk-js'

import * as config from './config'
import './index.less'
import { store } from './store'


// Start services here. Will move to a better place later.

// Generate in a better way. Perhaps something something HMAC to make sure it's one of ours.
class PostLoginRedirectInfo {
    @MarshalWith(m.AbsolutePathMarshaller)
    path: string;

    constructor(path: string) {
        this.path = path;
    }
}

class PostLoginRedirectInfoMarshaller extends m.BaseStringMarshaller<PostLoginRedirectInfo> {
    private static readonly _objectMarshaller = new (MarshalFrom(PostLoginRedirectInfo))();

    build(a: string): PostLoginRedirectInfo {
	try {
	    const redirectInfoSer = decodeURIComponent(a);
	    const redirectInfoRaw = JSON.parse(redirectInfoSer);
	    return PostLoginRedirectInfoMarshaller._objectMarshaller.extract(redirectInfoRaw);
	} catch (e) {
	    throw new ExtractError(`Could not build redirect info "${e.toString()}"`);
	}
    }

    unbuild(redirectInfo: PostLoginRedirectInfo) {
	const redirectInfoRaw = PostLoginRedirectInfoMarshaller._objectMarshaller.pack(redirectInfo);
	const redirectInfoSer = JSON.stringify(redirectInfoRaw);
	return encodeURIComponent(redirectInfoSer);
    }
}

class Auth0RedirectInfo {
    @MarshalWith(Auth0AccessTokenMarshaller)
    access_token: string;
    
    @MarshalWith(PostLoginRedirectInfoMarshaller)
    state: PostLoginRedirectInfo;
}

const postLoginRedirectInfoMarshaller = new PostLoginRedirectInfoMarshaller();
const auth0RedirectInfoMarshaller = new (MarshalFrom(Auth0RedirectInfo))();

const accessToken: string|null = _loadAccessToken();
let identityService: IdentityService|null;

const currentLocation = browserHistory.getCurrentLocation();

const postLoginInfo = new PostLoginRedirectInfo(currentLocation.pathname);
const postLoginInfoSer = postLoginRedirectInfoMarshaller.pack(postLoginInfo);

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
    identityService = newIdentityService(accessToken, config.IDENTITY_SERVICE_HOST);
} else if (currentLocation.pathname == '/real/login') {
    const queryParsed = queryString.parse((currentLocation as any).hash);
    const auth0RedirectInfo = auth0RedirectInfoMarshaller.extract(queryParsed);
    _saveAccessToken(auth0RedirectInfo.access_token);

    identityService = newIdentityService(auth0RedirectInfo.access_token, config.IDENTITY_SERVICE_HOST);
    browserHistory.push(auth0RedirectInfo.state.path);
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
