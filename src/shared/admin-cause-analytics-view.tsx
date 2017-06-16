import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'

import { CauseAnalytics } from '@neoncity/core-sdk-js'
import { isLocal } from '@neoncity/common-js'

import * as config from './config'
import { AdminCauseAnalyticsState, OpState, StatePart } from '../shared/store'

import * as text from './admin-cause-analytics-view.text'
import * as commonText from './common.text'


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
            const causeAnalytics = await config.CORE_PRIVATE_CLIENT().getCauseAnalytics();
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
        const helmet =
            <Helmet>
                <title>{text.pageTitle[config.LANG()]}</title>
            </Helmet>;
                        
        if (this.props.isLoading) {
            return <div>{helmet}{commonText.loading[config.LANG()]}</div>;
	} else if (this.props.isFailed) {
	    return <div>{helmet}{commonText.loadingFailed[config.LANG()]}</div>;
	} else if (!this.props.hasCause) {
            return <div>{helmet}{text.noCause[config.LANG()]}</div>;
	} else {
            const causeAnalytics = this.props.causeAnalytics as CauseAnalytics;
            
            return (
                <div>
                    {helmet}
                    <p>{text.daysLeft[config.LANG()](causeAnalytics.daysLeft)}</p>
                    <p>{text.donorsCount[config.LANG()](causeAnalytics.donorsCount)}</p>
                    <p>{text.donationsCount[config.LANG()](causeAnalytics.donationsCount)}</p>
                    <p>{text.donatedAmount[config.LANG()](causeAnalytics.amountDonated.amount, causeAnalytics.amountDonated.currency.toString())}</p>
                    <p>{text.sharersCount[config.LANG()](causeAnalytics.sharersCount)}</p>
                    <p>{text.sharesCount[config.LANG()](causeAnalytics.sharesCount)}</p>
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
