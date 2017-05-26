import * as React from 'react'
import { connect } from 'react-redux'

import { CauseAnalytics } from '@neoncity/core-sdk-js'
import { isLocal } from '@neoncity/common-js'

import { SESSION_ID, AUTH0_ACCESS_TOKEN } from './from-server'
import * as config from './config'
import { corePrivateClient } from './services'
import { AdminCauseAnalyticsState, OpState, StatePart } from './store'


interface Props {
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    hasCause: boolean;
    causeAnalytics: CauseAnalytics|null;
    errorMessage: string|null;
    onCauseAnalyticsLoading: () => void;
    onCauseAnalyticsReady: (hasCause: boolean, causeAnalytics: CauseAnalytics|null) => void;
    onCauseAnalyticsFailed: (errorMessage: string) => void;
}


class _AdminCauseAnalyticsView extends React.Component<Props, undefined> {
    async componentDidMount() {
        this.props.onCauseAnalyticsLoading();

        try {
            const causeAnalytics = await corePrivateClient.getCauseAnalytics(SESSION_ID, AUTH0_ACCESS_TOKEN);
            this.props.onCauseAnalyticsReady(true, causeAnalytics);
        } catch (e) {
            if (e.name == 'NoCauseForUserError') {
                this.props.onCauseAnalyticsReady(false, null);
            } else {
                if (isLocal(config.ENV)) {
                    console.log(e);
                }
            
                this.props.onCauseAnalyticsFailed('Could not load cause analytics for user');
            }
        }
    }
    
    render() {
        if (this.props.isLoading) {
            return <div>Loading ...</div>;
	} else if (this.props.isFailed) {
	    return <div>Failed {this.props.errorMessage}</div>;
	} else if (!this.props.hasCause) {
            return <div>There is no cause. Please create one to see analytics</div>;
	} else {
            const causeAnalytics = this.props.causeAnalytics as CauseAnalytics;
            
            return (
                <div>
                    <p>Days left: {causeAnalytics.daysLeft}</p>
                    <p>Donors count: {causeAnalytics.donorsCount}</p>
                    <p>Donations count: {causeAnalytics.donationsCount}</p>
                    <p>Donatin amount: {causeAnalytics.amountDonated.amount} {causeAnalytics.amountDonated.currency.toString()}</p>
                    <p>Sharers count: {causeAnalytics.sharersCount}</p>
                    <p>Shares count: {causeAnalytics.sharesCount}</p>
                </div>
            );
        }
    }
}


function stateToProps(state: any) {
    return {
        isLoading: state.adminCauseAnalytics.type == OpState.Init || state.adminCauseAnalytics.type == OpState.Loading,
        isReady: state.adminCauseAnalytics.type == OpState.Ready,
        isFailed: state.adminCauseAnalytics.type == OpState.Failed,
        hasCause: state.adminCauseAnalytics.type == OpState.Ready ? state.adminCauseAnalytics.hasCause : false,
        causeAnalytics: state.adminCauseAnalytics.type == OpState.Ready ? state.adminCauseAnalytics.causeAnalytics : null,
        errorMessage: state.adminCauseAnalytics.type == OpState.Failed ? state.adminCauseAnalytics.errorMessage : null
    };
}


function dispatchToProps(dispatch: (newState: AdminCauseAnalyticsState) => void) {
    return {
	onCauseAnalyticsLoading: () => dispatch({part: StatePart.AdminCauseAnalytics, type: OpState.Loading}),
	onCauseAnalyticsReady: (hasCause: boolean, causeAnalytics: CauseAnalytics|null) => dispatch({part: StatePart.AdminCauseAnalytics, type: OpState.Ready, hasCause: hasCause, causeAnalytics: causeAnalytics}),
	onCauseAnalyticsFailed: (errorMessage: string) => dispatch({part: StatePart.AdminCauseAnalytics, type: OpState.Failed, errorMessage: errorMessage})
    };
}


export const AdminCauseAnalyticsView = connect(stateToProps, dispatchToProps)(_AdminCauseAnalyticsView);
