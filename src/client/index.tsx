import Auth0Lock from 'auth0-lock'
import * as theMoment from 'moment'
import * as queryString from 'query-string'
import * as r from 'raynor'
import { ExtractError, MarshalFrom, MarshalWith } from 'raynor'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Provider, connect } from 'react-redux'
import { Router, Route, IndexRoute, IndexRedirect, Link, browserHistory } from 'react-router'

import { slugify } from '@neoncity/common-js/slugify'
import { Cause, CorePrivateClient, CorePublicClient, DonationForUser, ShareForUser, newCorePrivateClient, newCorePublicClient, PrivateCause, PublicCause, UserActionsOverview } from '@neoncity/core-sdk-js'
import { Auth0AccessTokenMarshaller, IdentityClient, newIdentityClient, User } from '@neoncity/identity-sdk-js'

import * as config from './config'
import './index.less'
import { AdminMyActionsState, AdminMyCauseState, OpState, IdentityState, PublicCausesState, PublicCauseDetailState, StatePart, store } from './store'

// Old style imports.
const moment = require('moment')


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
	        <h2><Link to={_causeLink(this.props.cause)}>{this.props.cause.title}</Link></h2>
		<p>{this.props.cause.description}</p>
		<p>{this.props.cause.goal.amount} - {this.props.cause.goal.currency}</p>
		<p>{this.props.cause.deadline.toString()}</p>
	    </div>
	);
    }
}


interface DonationForUserProps {
    donationForUser: DonationForUser;
}


class DonationForUserWidget extends React.Component<DonationForUserProps, undefined> {
    render() {
	const donation = this.props.donationForUser;
	const cause = this.props.donationForUser.forCause;
	const timeCreated = donation.timeCreated.toString();
	
	return (
		<p>To <Link to={_causeLink(cause)}>{cause.title}</Link> donated {donation.amount.amount} {donation.amount.currency} on {timeCreated}</p>
	);
    }
}


interface ShareForUserProps {
    shareForUser: ShareForUser;
}


class ShareForUserWidget extends React.Component<ShareForUserProps, undefined> {
    render() {
	const share = this.props.shareForUser;
	const cause = this.props.shareForUser.forCause;
	const timeCreated = share.timeCreated.toString();
	
	return (
		<p>To <Link to={`/c/${cause.id}/${cause.slug}`}>{cause.title}</Link> shared on {timeCreated}</p>
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
	    // Also update the URL to be _causeLink(cause), but it should do no navigation.
	    // Users might access this as /c/$id/$firstSlug, but the actual slug assigned
	    // might be $secondSlog. So we wish to replace the one they specified with
	    // /c/$id/$secondSlug
	    browserHistory.replace(_causeLink(cause));
	} catch (e) {
	    console.log('Here');
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
    onPrivateCauseReady: (hasCause: boolean, cause: PrivateCause|null) => void;
    onPrivateCauseFailed: (errorMessage: string) => void;
}


interface AdminMyCauseViewState {
    showCreationFormIfNoControls: boolean;
    modifiedGeneral: boolean;
    title: string;
    slug: string;
    description: string;
    deadline: theMoment.Moment;
    goalAmount: number;
    goalCurrency: string;
}


class _AdminMyCauseView extends React.Component<AdminMyCauseProps, AdminMyCauseViewState> {
    private static readonly _initialState = {
	showCreationFormIfNoControls: false,
	modifiedGeneral: false,
	title: '',
	slug: '',
	description: '',
	deadline: moment(),
	goalAmount: 100,
	goalCurrency: 'RON'
    };
    
    constructor(props: AdminMyCauseProps, context: any) {
	super(props, context);
	this.state = (Object as any).assign({}, _AdminMyCauseView._initialState);
    }
    
    async componentDidMount() {
        this.props.onPrivateCauseLoading();

        try {
            const privateCause = await corePrivateClient.getCause(accessToken);
            this.props.onPrivateCauseReady(true, privateCause);
        } catch (e) {
            if (e.name == 'NoCauseForUserError') {
                this.props.onPrivateCauseReady(false, null);
            } else {
                this.props.onPrivateCauseFailed('Could not load cause for user');
            }
        }
    }

    componentWillReceiveProps(newProps: AdminMyCauseProps) {
	if (newProps.isReady) {
	    this.setState(this._fullStateFromProps(newProps));
	}
    }

    componentWillMount() {
	if (this.props.isReady) {
	    this.setState(this._fullStateFromProps(this.props));
	}
    }
    
    render() {
	const editForm = (<div>
			  <form>
			  <label htmlFor="admin-my-cause-title">Title</label>
			  <input id="admin-my-cause-title" type="text" value={this.state.title} onChange={this._handleTitleChange.bind(this)} placeholder="Cause title..." />
			  <p>{this.state.slug}</p>
			  <label htmlFor="admin-my-cause-description">Description</label>
			  <input id="admin-my-cause-description" type="text" value={this.state.description} onChange={this._handleDescriptionChange.bind(this)} placeholder="Cause description..." />
			  <div><ReactDatePicker selected={this.state.deadline} onChange={this._handleDeadlineChange.bind(this)} /></div>
                          <label htmlFor="admin-my-cause-goal-amount">Goal amount</label>
                          <input id="admin-my-cause-goal-amount" type="number" value={this.state.goalAmount} onChange={this._handleGoalAmountChange.bind(this)} placeholder="100" />
                          <label htmlFor="admin-my-cause-goal-currency">Goal currency</label>
                          <div>
                          <select id="admin-my-cause-goal-currency" value={this.state.goalCurrency} onChange={this._handleGoalCurrencyChange.bind(this)}>
                          <option value="RON">RON</option>
                          <option value="EUR">EUR</option>
                          </select>
                          </div>
			  </form>
			  </div>
			 );
	
	if (this.props.isLoading) {
	    return (<div>Loading ...</div>);
	} else if (this.props.isFailed) {
	    return (<div>Failed {this.props.errorMessage}</div>);
	} else if (!this.props.hasCause) {
	    if (!this.state.showCreationFormIfNoControls) {
		return (<div>There is no cause<button onClick={this._handleShowCreationForm.bind(this)}>Create cause</button></div>);
	    } else {
		return (<div>Creation form {editForm}</div>);
	    }
        } else {
            const cause = this.props.cause as PrivateCause;
            
            return (<div>{cause.title} {editForm}</div>);
        }
    }

    private _fullStateFromProps(props: AdminMyCauseProps): AdminMyCauseViewState {
	if (!props.hasCause) {
	    return (Object as any).assign({}, _AdminMyCauseView._initialState);
	}
	
	const cause = props.cause as PrivateCause;
	
	return {
	    showCreationFormIfNoControls: false,
	    modifiedGeneral: false,
	    title: cause.title,
	    slug: cause.slug,
	    description: cause.description,
	    deadline: moment(cause.deadline),
	    goalAmount: cause.goal.amount,
	    goalCurrency: cause.goal.currency
	};
    }

    private _handleShowCreationForm() {
	this.setState({showCreationFormIfNoControls: true});
    }

    private _handleTitleChange(e: React.FormEvent<HTMLInputElement>) {
	this.setState({modifiedGeneral: true, title: e.currentTarget.value, slug: slugify(e.currentTarget.value)});
    }

    private _handleDescriptionChange(e: React.FormEvent<HTMLInputElement>) {
	this.setState({modifiedGeneral: true, description: e.currentTarget.value});
    }

    private _handleDeadlineChange(newDeadline: theMoment.Moment) {
	this.setState({modifiedGeneral: true, deadline: newDeadline});
    }

    private _handleGoalAmountChange(e: React.FormEvent<HTMLInputElement>) {
	this.setState({modifiedGeneral: true, goalAmount: parseInt(e.currentTarget.value)});
    }

    private _handleGoalCurrencyChange(e: React.FormEvent<HTMLInputElement>) {
	this.setState({modifiedGeneral: true, goalCurrency: e.currentTarget.value});
    }
}


function adminMyCauseMapStateToProps(state: any) {
    return {
	isLoading: state.adminMyCause.type == OpState.Init || state.adminMyCause.type == OpState.Loading,
	isReady: state.adminMyCause.type == OpState.Ready,
	isFailed: state.adminMyCause.type == OpState.Failed,
        hasCause: state.adminMyCause.type == OpState.Ready ? state.adminMyCause.hasCause : false,
        cause: state.adminMyCause.type == OpState.Ready ? state.adminMyCause.cause : null,
	errorMessage: state.adminMyCause.type == OpState.Failed ? state.adminMyCause.errorMessage : null
    };
}


function adminMyCauseMapDispatchToProps(dispatch: (newState: AdminMyCauseState) => void) {
    return {
	onPrivateCauseLoading: () => dispatch({part: StatePart.AdminMyCause, type: OpState.Loading}),
	onPrivateCauseReady: (hasCause: boolean, cause: PrivateCause) => dispatch({part: StatePart.AdminMyCause, type: OpState.Ready, hasCause: hasCause, cause: cause}),
	onPrivateCauseFailed: (errorMessage: string) => dispatch({part: StatePart.AdminMyCause, type: OpState.Failed, errorMessage: errorMessage})
    };
}


const AdminMyCauseView = connect(
    adminMyCauseMapStateToProps,
    adminMyCauseMapDispatchToProps)(_AdminMyCauseView);


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
	    const donationWidgets = (this.props.userActionsOverview as UserActionsOverview)
		  .donations
		  .slice(0) // clone
		  .sort((a, b) => b.timeCreated.getTime() - a.timeCreated.getTime())
		  .map((d) => <DonationForUserWidget key={d.id} donationForUser={d} />);
	    const shareWidgets = (this.props.userActionsOverview as UserActionsOverview)
		  .shares
		  .slice(0) // clone
		  .sort((a, b) => b.timeCreated.getTime() - a.timeCreated.getTime())
		  .map((d) => <ShareForUserWidget key={d.id} shareForUser={d} />);	    

	    return (
                <div>
		    <h6>Donations</h6>
		    {donationWidgets}
		    <h6>Shares</h6>
		    {shareWidgets}
		</div>
	    );
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


function _causeLink(cause: Cause): string {
    return `/c/${cause.id}/${cause.slug}`;
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
