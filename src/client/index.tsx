import Auth0Lock from 'auth0-lock'
import * as queryString from 'query-string'
import * as r from 'raynor'
import { ExtractError, MarshalFrom, MarshalWith } from 'raynor'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider, connect } from 'react-redux'
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router'

import { Auth0AccessTokenMarshaller, IdentityClient, newIdentityClient, User } from '@neoncity/identity-sdk-js'

import * as config from './config'
import './index.less'
import { OpState, IdentityState, store } from './store'


// Start services here. Will move to a better place later.


class AllowedRoutesMarshaller extends r.AbsolutePathMarshaller {
    filter(path: string): string {
	if (!(path == '/'
	      || path.indexOf('/c/') == 0
	      || path.indexOf('/admin') == 0
	      || path.indexOf('/console') == 0)) {
	    throw new ExtractError('Expected one of our paths');
	}

	return path;
    }
}

// Generate in a better way. Perhaps something something HMAC to make sure it's one of ours.
class PostLoginRedirectInfo {
    @MarshalWith(AllowedRoutesMarshaller)
    path: string;

    constructor(path: string) {
        this.path = path;
    }
}

class PostLoginRedirectInfoMarshaller extends r.BaseStringMarshaller<PostLoginRedirectInfo> {
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

let rawAccessToken: string|null = _loadAccessToken();
let identityClient: IdentityClient|null;

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

let accessToken: string = 'INVALID';

if (rawAccessToken != null) {
    identityClient = newIdentityClient(config.IDENTITY_SERVICE_HOST);
    accessToken = rawAccessToken;
} else if (currentLocation.pathname == '/real/login') {
    const queryParsed = (Object as any).assign({}, queryString.parse((currentLocation as any).hash));
    const auth0RedirectInfo = auth0RedirectInfoMarshaller.extract(queryParsed);
    _saveAccessToken(auth0RedirectInfo.access_token);
    accessToken = auth0RedirectInfo.access_token;
    
    identityClient = newIdentityClient(config.IDENTITY_SERVICE_HOST);
    browserHistory.push(auth0RedirectInfo.state.path);
} else if ((currentLocation.pathname.indexOf('/admin') == 0) || (currentLocation.pathname.indexOf('/console') == 0)) {
    auth0.show();
} else {
    identityClient = null;
}


function _saveAccessToken(accessToken: string) {
    localStorage.setItem('neoncity/access_token', accessToken);
}


function _loadAccessToken(): string|null {
    return localStorage.getItem('neoncity/access_token');
}


function _clearAccessToken() {
    return localStorage.removeItem('neoncity/access_token');
}

interface AppFrameProps {
    user: User|null;
    onIdentityLoading: () => void;
    onIdentityReady: (user: User) => void;
    onIdentityFailed: (errorMessage: string) => void;
    children: React.ReactNode;
}


class _AppFrame extends React.Component<AppFrameProps, undefined> {
    async componentDidMount() {
        if (identityClient == null) {
	    return;
        }

	this.props.onIdentityLoading();

	try {
	    const user = await identityClient.getOrCreateUser(accessToken);
	    this.props.onIdentityReady(user);
	} catch (e) {
	    if ((currentLocation.pathname.indexOf('/admin') == 0) || (currentLocation.pathname.indexOf('/console') == 0)) {
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

		_clearAccessToken();
	        auth0.show();
            }
	    
	    this.props.onIdentityFailed('Could not load user');
	}
    }
    
    render() {
	const userIdSection = this.props.user != null ? <p>User: {this.props.user.name}</p> : <p></p>;
	// Bit of a hack. If there's no user, the global navigation to admin and console is done through a regular <a> tag
	// which will trigger a page load event. This is not so bad, as the login flow is beefy as it is, but it does add
	// _some_ extra complexity. Hopefully it will be easy to get rid of in the future.
	// TODO: make this simpler / work through the single-page setup.
        if (this.props.user == null) {
            return (
                <div>
                    <div>This is the app frame</div>
                    <div>
                        <Link to="/">Home</Link>
                        <Link to="/c/cause-1">Cause 1</Link>
                        <Link to="/c/cause-2">Cause 2</Link>
                        <a href="/admin">Admin</a>
                        <a href="/console">Console</a>
                        {userIdSection}
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
                        <Link to="/c/cause-1">Cause 1</Link>
                        <Link to="/c/cause-2">Cause 2</Link>
                        <Link to="/admin">Admin</Link>
                        <Link to="/console">Console</Link>
                        {userIdSection}
                    </div>
                    {this.props.children}
                </div>
            );      
        }
    }
}

function mapStateToProps(state: any) {
    return {
	user: typeof state.identity.user != 'undefined' ? state.identity.user : null
    };
}


function mapDispatchToProps(dispatch: (newState: IdentityState) => void) {
    return {
	onIdentityLoading: () => dispatch({type: OpState.Loading}),
	onIdentityReady: (user: User) => dispatch({type: OpState.Ready, user: user}),
	onIdentityFailed: (errorMessage: string) => dispatch({type: OpState.Failed, errorMessage: errorMessage})
    };
}


const AppFrame = connect(
    mapStateToProps,
    mapDispatchToProps)(_AppFrame);


interface IdentityFrameProps {
}


class IdentityFrame extends React.Component<IdentityFrameProps, undefined> {
    async componentDidMount() {
        if (identityClient == null) {
            auth0.show();
        }
    }
    
    render() {
        if (identityClient == null) {
	    return (<div>Should be logged in</div>);
	} else {
	    return (<div>{this.props.children}</div>);
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
    user: User;
}


class AdminView extends React.Component<AdminViewProps, undefined> {
    render() {
        return (
	    <div>This is the admin view</div>
        );
    }
}


interface ConsoleViewProps {
    user: User;
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
