import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'

import { UserActionsOverview } from '@neoncity/core-sdk-js'
import { isLocal } from '@neoncity/common-js'

import * as config from './config'
import { DonationForSessionWidget } from './donation-for-session-widget'
import { ShareForSessionWidget } from './share-for-session-widget'
import { AdminMyActionsState, OpState, StatePart } from '../shared/store'

import * as text from './admin-myactions-view.text'
import * as commonText from './common.text'


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
	    const userActionsOverview = await config.CORE_PRIVATE_CLIENT().getUserActionsOverview();
	    this.props.onUserActionsOverviewReady(userActionsOverview);
	} catch (e) {
            if (isLocal(config.ENV)) {
                console.log(e);
            }
            
	    this.props.onUserActionsOverviewFailed('Could not load user actions overview');
	}
    }
    
    render() {
        const helmet =
            <Helmet>
                <title>{text.pageTitle[config.LANG()]}</title>
                <meta name="robots" content="noindex,nofollow" />
             </Helmet>;
        
	if (this.props.isLoading) {
	    return (
		<div className="loading">
		   {helmet}
                   <span className="message">{commonText.loading[config.LANG()]}</span>
	        </div>
	    );
	} else if (this.props.isFailed) {
	    return (
                <div className="failed">
                    {helmet}
                    <span className="message">{commonText.loadingFailed[config.LANG()]}</span>
                </div>
	    );
	} else {
            const userActionsOverview = this.props.userActionsOverview as UserActionsOverview;
            const amountsDonated = userActionsOverview
                  .amountsDonatedByCurrency
                  .map(crc => <p key={crc.toString()}>{text.amountsDonated[config.LANG()](crc)}</p>);
	    const latestDonationWidgets = userActionsOverview
		  .latestDonations
		  .slice(0) // clone
		  .sort((a, b) => b.timeCreated.getTime() - a.timeCreated.getTime())
		  .map((d) => <DonationForSessionWidget key={d.id} donationForSession={d} />);
	    const latestShareWidgets = userActionsOverview
		  .latestShares
		  .slice(0) // clone
		  .sort((a, b) => b.timeCreated.getTime() - a.timeCreated.getTime())
		  .map((d) => <ShareForSessionWidget key={d.id} shareForSession={d} />);

	    return (
                <div id="admin-myactions-view">
                    {helmet}
                    <div className="high-level">
                        <p>{text.donationsCount[config.LANG()](userActionsOverview.donationsCount)}</p>
                        {amountsDonated}
                        <p>{text.sharesCount[config.LANG()](userActionsOverview.sharesCount)}</p>
                    </div>
		    <h2>{text.donations[config.LANG()]}</h2>
		    {latestDonationWidgets}
		    <h2>{text.shares[config.LANG()]}</h2>
		    {latestShareWidgets}
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
