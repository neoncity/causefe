import * as React from 'react'
import { connect } from 'react-redux'

import { CorePrivateClient, UserActionsOverview } from '@neoncity/core-sdk-js'
import { isLocal } from '@neoncity/common-js'

import * as config from './config'
import { DonationForSessionWidget } from './donation-for-session-widget'
import { ShareForSessionWidget } from './share-for-session-widget'
import { AdminMyActionsState, OpState, StatePart } from '../shared/store'

import * as text from './admin-myactions-view.text'
import * as commonText from './common.text'


interface Props {
    corePrivateClient: CorePrivateClient;
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    userActionsOverview: UserActionsOverview|null;
    errorMessage: string|null;
    onUserActionsOverviewLoading: () => void;
    onUserActionsOverviewReady: (userActionsOverview: UserActionsOverview) => void;
    onUserActionsOverviewFailed: (errorMessage: string) => void;
}


class _AdminMyActionsView extends React.Component<Props, undefined> {
    async componentDidMount() {
	this.props.onUserActionsOverviewLoading();

	try {
	    const userActionsOverview = await this.props.corePrivateClient.getUserActionsOverview();
	    this.props.onUserActionsOverviewReady(userActionsOverview);
	} catch (e) {
            if (isLocal(config.ENV)) {
                console.log(e);
            }
            
	    this.props.onUserActionsOverviewFailed('Could not load user actions overview');
	}
    }
    
    render() {
	if (this.props.isLoading) {
	    return <div>{commonText.loading[config.LANG()]}</div>;
	} else if (this.props.isFailed) {
	    return <div>{commonText.loadingFailed[config.LANG()]}</div>;
	} else {
	    const donationWidgets = (this.props.userActionsOverview as UserActionsOverview)
		  .donations
		  .slice(0) // clone
		  .sort((a, b) => b.timeCreated.getTime() - a.timeCreated.getTime())
		  .map((d) => <DonationForSessionWidget key={d.id} donationForSession={d} />);
	    const shareWidgets = (this.props.userActionsOverview as UserActionsOverview)
		  .shares
		  .slice(0) // clone
		  .sort((a, b) => b.timeCreated.getTime() - a.timeCreated.getTime())
		  .map((d) => <ShareForSessionWidget key={d.id} shareForSession={d} />);

	    return (
                <div>
		    <h6>{text.donations[config.LANG()]}</h6>
		    {donationWidgets}
		    <h6>{text.shares[config.LANG()]}</h6>
		    {shareWidgets}
		</div>
	    );
	}
    }
}


function stateToProps(state: any) {
    return {
	corePrivateClient: state.request.services != null ? state.request.services.corePrivateClient : null,
	isLoading: state.adminMyActions.type == OpState.Init || state.adminMyActions.type == OpState.Loading,
	isReady: state.adminMyActions.type == OpState.Ready,
	isFailed: state.adminMyActions.type == OpState.Failed,
	userActionsOverview: state.adminMyActions.type == OpState.Ready ? state.adminMyActions.userActionsOverview : null,
	errorMessage: state.adminMyActions.type == OpState.Failed ? state.adminMyActions.errorMessage : null
    };
}


function dispatchToProps(dispatch: (newState: AdminMyActionsState) => void) {
    return {
	onUserActionsOverviewLoading: () => dispatch({part: StatePart.AdminMyActions, type: OpState.Loading}),
	onUserActionsOverviewReady: (userActionsOverview: UserActionsOverview) => dispatch({part: StatePart.AdminMyActions, type: OpState.Ready, userActionsOverview: userActionsOverview}),
	onUserActionsOverviewFailed: (errorMessage: string) => dispatch({part: StatePart.AdminMyActions, type: OpState.Failed, errorMessage: errorMessage})
    };
}


export const AdminMyActionsView = connect(stateToProps, dispatchToProps)(_AdminMyActionsView);
