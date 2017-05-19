import * as React from 'react'
import { connect } from 'react-redux'

import { UserActionsOverview } from '@neoncity/core-sdk-js'
import { isLocal } from '@neoncity/common-js'

import { accessToken } from './access-token'
import * as config from './config'
import { DonationForUserWidget } from './donation-for-user-widget'
import { corePrivateClient } from './services'
import { ShareForUserWidget } from './share-for-user-widget'
import { AdminMyActionsState, OpState, StatePart } from './store'


interface Props {
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
	    const userActionsOverview = await corePrivateClient.getActionsOverview(accessToken);
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
	    return <div>Loading ...</div>;
	} else if (this.props.isFailed) {
	    return <div>Failed {this.props.errorMessage}</div>;
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


function stateToProps(state: any) {
    return {
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
