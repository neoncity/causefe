import Auth0Lock from 'auth0-lock'
import * as queryString from 'query-string'
import * as r from 'raynor'
import { ExtractError, MarshalFrom, MarshalWith } from 'raynor'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider, connect } from 'react-redux'
import { Router, Route, IndexRoute, IndexRedirect, Link, browserHistory } from 'react-router'

import { CorePrivateClient, CorePublicClient, newCorePrivateClient, newCorePublicClient, PrivateCause, PublicCause, UserActionsOverview } from '@neoncity/core-sdk-js'
import { Auth0AccessTokenMarshaller, IdentityClient, newIdentityClient, User } from '@neoncity/identity-sdk-js'

import * as config from './config'
import './index.less'
import { AdminMyActionsState, OpState, IdentityState, PublicCausesState, PublicCauseDetailState, StatePart, store } from './store'


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
const corePublicClient: CorePublicClient = newCorePublicClient(config.CORE_SERVICE_HOST);
const corePrivateClient: CorePrivateClient = newCorePrivateClient(config.CORE_SERVICE_HOST);

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

function appFrameMapStateToProps(state: any) {
    return {
	user: typeof state.identity.user != 'undefined' ? state.identity.user : null
    };
}


function appFrameMapDispatchToProps(dispatch: (newState: IdentityState) => void) {
    return {
	onIdentityLoading: () => dispatch({part: StatePart.Identity, type: OpState.Loading}),
	onIdentityReady: (user: User) => dispatch({part: StatePart.Identity, type: OpState.Ready, user: user}),
	onIdentityFailed: (errorMessage: string) => dispatch({part: StatePart.Identity, type: OpState.Failed, errorMessage: errorMessage})
    };
}


const AppFrame = connect(
    appFrameMapStateToProps,
    appFrameMapDispatchToProps)(_AppFrame);


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


interface PublicCauseWidgetProps {
    cause: PublicCause;
}


class PublicCauseWidget extends React.Component<PublicCauseWidgetProps, undefined> {
    render() {
	return (
            <div>
	        <h2><Link to={`/c/${this.props.cause.id}/${this.props.cause.slug}`}>{this.props.cause.title}</Link></h2>
		<p>{this.props.cause.description}</p>
		<p>{this.props.cause.goal.amount} - {this.props.cause.goal.currency}</p>
		<p>{this.props.cause.deadline.toString()}</p>
	    </div>
	);
    }
}


interface HomeViewProps {
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    causes: PublicCause[]|null;
    errorMessage: string|null;
    onPublicCausesLoading: () => void;
    onPublicCausesReady: (causes: PublicCause[]) => void;
    onPublicCausesFailed: (errorMessage: string) => void;
}


class _HomeView extends React.Component<HomeViewProps, undefined> {
    async componentDidMount() {
	this.props.onPublicCausesLoading();

	try {
	    const causes = await corePublicClient.getCauses(accessToken);
	    this.props.onPublicCausesReady(causes);
	} catch (e) {
	    this.props.onPublicCausesFailed('Could not load public causes');
	}
    }
    
    render() {
	if (this.props.isLoading) {
	    return (<div>Loading ...</div>);
	} else if (this.props.isFailed) {
	    return (<div>Failed {this.props.errorMessage}</div>);
	} else {
	    const causes = (this.props.causes as PublicCause[]).map(c => <PublicCauseWidget key={c.id} cause={c} />);
	    
	    return (<div>{causes}</div>);
	}
    }
}


function homeViewMapStateToProps(state: any) {
    return {
	isLoading: state.publicCauses.type == OpState.Init || state.publicCauses.type == OpState.Loading,
	isReady: state.publicCauses.type == OpState.Ready,
	isFailed: state.publicCauses.type == OpState.Failed,
	causes: state.publicCauses.type == OpState.Ready ? state.publicCauses.causes : null,
	errorMessage: state.publicCauses.type == OpState.Failed ? state.publicCauses.errorMessage : null,
    };
}


function homeViewMapDispatchToProps(dispatch: (newState: PublicCausesState) => void) {
    return {
	onPublicCausesLoading: () => dispatch({part: StatePart.PublicCauses, type: OpState.Loading}),
	onPublicCausesReady: (causes: PublicCause[]) => dispatch({part: StatePart.PublicCauses, type: OpState.Ready, causes: causes}),
	onPublicCausesFailed: (errorMessage: string) => dispatch({part: StatePart.PublicCauses, type: OpState.Failed, errorMessage: errorMessage})
    };
}


const HomeView = connect(
    homeViewMapStateToProps,
    homeViewMapDispatchToProps)(_HomeView);


interface CauseViewParams {
    causeId: string;
    causeSlug: string;
}


interface CauseViewProps {
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    params: CauseViewParams;
    cause: PublicCause|null;
    errorMessage: string|null;
    onPublicCauseDetailLoading: () => void;
    onPublicCauseDetailReady: (cause: PublicCause) => void;
    onPublicCauseDetailFailed: (errorMessage: string) => void;
}


class _CauseView extends React.Component<CauseViewProps, undefined> {
    async componentDidMount() {
	this.props.onPublicCauseDetailLoading();

	try {
	    const causeId = parseInt(this.props.params.causeId);
	    const cause = await corePublicClient.getCause(accessToken, causeId);
	    this.props.onPublicCauseDetailReady(cause);
	} catch (e) {
	    this.props.onPublicCauseDetailFailed('Could not load public cause detail');
	}
    }
    
    render() {
	if (this.props.isLoading) {
	    return (<div>Loading ...</div>);
	} else if (this.props.isFailed) {
	    return (<div>Failed {this.props.errorMessage}</div>);
	} else {
	    return <PublicCauseWidget cause={this.props.cause as PublicCause} />;
	}
    }
}


function causeViewMapStateToProps(state: any) {
    return {
	isLoading: state.publicCauseDetail.type == OpState.Init || state.publicCauseDetail.type == OpState.Loading,
	isReady: state.publicCauseDetail.type == OpState.Ready,
	isFailed: state.publicCauseDetail.type == OpState.Failed,
	cause: state.publicCauseDetail.type == OpState.Ready ? state.publicCauseDetail.cause : null,
	errorMessage: state.publicCauseDetail.type == OpState.Failed ? state.publicCauseDetail.errorMessage : null,
    };
}


function causeViewMapDispatchToProps(dispatch: (newState: PublicCauseDetailState) => void) {
    return {
	onPublicCauseDetailLoading: () => dispatch({part: StatePart.PublicCauseDetail, type: OpState.Loading}),
	onPublicCauseDetailReady: (cause: PublicCause) => dispatch({part: StatePart.PublicCauseDetail, type: OpState.Ready, cause: cause}),
	onPublicCauseDetailFailed: (errorMessage: string) => dispatch({part: StatePart.PublicCauseDetail, type: OpState.Failed, errorMessage: errorMessage})
    };
}


const CauseView = connect(
    causeViewMapStateToProps,
    causeViewMapDispatchToProps)(_CauseView);


interface AdminFrameProps {
    user: User;
    children: React.ReactNode;
}


class AdminFrame extends React.Component<AdminFrameProps, undefined> {
    render() {
        return (
            <div>
                <div>This is the admin view</div>
                <Link to="/admin/updates">Updates</Link>
                <Link to="/admin/my-cause">My Cause</Link>
                <Link to="/admin/my-actions">My Actions</Link>
                <Link to="/admin/account">Account</Link>
                {this.props.children}
            </div>
        );
    }
}


interface AdminUpdatesProps {
}


class AdminUpdatesView extends React.Component<AdminUpdatesProps, undefined> {
    render() {
        return (<div>This is the updates section</div>);
    }
}


interface AdminMyCauseProps {
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    hasCause: boolean;
    cause: PrivateCause|null;
    errorMessage: string|null;
    onPrivateCauseLoading: () => void;
    onPrivateCauseReady: (hasCause: boolean, cause: PrivateCause) => void;
    onPrivateCasseFailed: (errorMessage: string) => void;
}


class AdminMyCauseView extends React.Component<AdminMyCauseProps, undefined> {
    render() {
        return (<div>This is the my cause section</div>);
    }
}


interface AdminMyActionsProps {
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    userActionsOverview: UserActionsOverview|null;
    errorMessage: string|null;
    onUserActionsOverviewLoading: () => void;
    onUserActionsOverviewReady: (userActionsOverview: UserActionsOverview) => void;
    onUserActionsOverviewFailed: (errorMessage: string) => void;
}


class _AdminMyActionsView extends React.Component<AdminMyActionsProps, undefined> {
    async componentDidMount() {
	this.props.onUserActionsOverviewLoading();

	try {
	    const userActionsOverview = await corePrivateClient.getActionsOverview(accessToken);
	    this.props.onUserActionsOverviewReady(userActionsOverview);
	} catch (e) {
	    this.props.onUserActionsOverviewFailed('Could not load user actions overview');
	}
    }
    
    render() {
	if (this.props.isLoading) {
	    return (<div>Loading ...</div>);
	} else if (this.props.isFailed) {
	    return (<div>Failed {this.props.errorMessage}</div>);
	} else {
            return (<div>This is the my {(this.props.userActionsOverview as UserActionsOverview).donations.length} / {(this.props.userActionsOverview as UserActionsOverview).shares.length} actions section</div>);
	}
    }
}


function adminMyActionsMapStateToProps(state: any) {
    return {
	isLoading: state.adminMyActions.type == OpState.Init || state.adminMyActions.type == OpState.Loading,
	isReady: state.adminMyActions.type == OpState.Ready,
	isFailed: state.adminMyActions.type == OpState.Failed,
	userActionsOverview: state.adminMyActions.type == OpState.Ready ? state.adminMyActions.userActionsOverview : null,
	errorMessage: state.adminMyActions.type == OpState.Failed ? state.adminMyActions.errorMessage : null
    };
}


function adminMyActionsMapDispatchToProps(dispatch: (newState: AdminMyActionsState) => void) {
    return {
	onUserActionsOverviewLoading: () => dispatch({part: StatePart.AdminMyActions, type: OpState.Loading}),
	onUserActionsOverviewReady: (userActionsOverview: UserActionsOverview) => dispatch({part: StatePart.AdminMyActions, type: OpState.Ready, userActionsOverview: userActionsOverview}),
	onUserActionsOverviewFailed: (errorMessage: string) => dispatch({part: StatePart.AdminMyActions, type: OpState.Failed, errorMessage: errorMessage})
    };
}


const AdminMyActionsView = connect(
    adminMyActionsMapStateToProps,
    adminMyActionsMapDispatchToProps)(_AdminMyActionsView);


interface AdminAccountProps {
}


class AdminAccountView extends React.Component<AdminAccountProps, undefined> {
    render() {
        return (<div>This is the account section</div>);
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
                <Route path="c/:causeId/:causeSlug" component={CauseView} />

                <Route path="/" component={IdentityFrame}>
                    <Route path="admin" component={AdminFrame}>
		        <IndexRedirect to="updates" />
			<Route path="updates" component={AdminUpdatesView} />
			<Route path="my-cause" component={AdminMyCauseView} />
			<Route path="my-actions" component={AdminMyActionsView} />
			<Route path="account" component={AdminAccountView} />
                    </Route>
                    <Route path="console" component={ConsoleView} />
                </Route>
            </Route>
        </Router>
    </Provider>,
    document.getElementById('app')
);
