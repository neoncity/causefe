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
    causeAnalytics: CauseAnalytics | null;
    errorMessage: string | null;
    onCauseAnalyticsLoading: () => void;
    onCauseAnalyticsReady: (hasCause: boolean, causeAnalytics: CauseAnalytics | null) => void;
    onCauseAnalyticsFailed: (errorMessage: string) => void;
}


class _AdminCauseAnalyticsView extends React.Component<Props, {}> {
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
        } else if (!this.props.hasCause) {
            return <div>{helmet}{text.noCause[config.LANG()]}</div>;
        } else {
            const causeAnalytics = this.props.causeAnalytics as CauseAnalytics;

            return (
                <div id="admin-cause-analytics-view">
                    {helmet}
                    <table id="cause-analytics-table">
                        <tbody>
                            <tr>
                                <td>{text.daysLeft[config.LANG()]}</td>
                                <td>{causeAnalytics.daysLeft}</td>
                            </tr>

                            <tr>
                                <td>{text.donorsCount[config.LANG()]}</td>
                                <td>{causeAnalytics.donorsCount}</td>
                            </tr>

                            <tr>
                                <td>{text.donationsCount[config.LANG()]}</td>
                                <td>{causeAnalytics.donationsCount}</td>
                            </tr>

                            <tr>
                                <td>{text.donatedAmount[config.LANG()]}</td>
                                <td>{causeAnalytics.amountDonated.amount} {causeAnalytics.amountDonated.currency.toString()}</td>
                            </tr>

                            <tr>
                                <td>{text.sharersCount[config.LANG()]}</td>
                                <td>{causeAnalytics.sharersCount}</td>
                            </tr>

                            <tr>
                                <td>{text.sharesCount[config.LANG()]}</td>
                                <td>{causeAnalytics.sharesCount}</td>
                            </tr>
                        </tbody>
                    </table>
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
        onCauseAnalyticsLoading: () => dispatch({ part: StatePart.AdminCauseAnalytics, type: OpState.Loading }),
        onCauseAnalyticsReady: (hasCause: boolean, causeAnalytics: CauseAnalytics | null) => dispatch({ part: StatePart.AdminCauseAnalytics, type: OpState.Ready, hasCause: hasCause, causeAnalytics: causeAnalytics }),
        onCauseAnalyticsFailed: (errorMessage: string) => dispatch({ part: StatePart.AdminCauseAnalytics, type: OpState.Failed, errorMessage: errorMessage })
    };
}


export const AdminCauseAnalyticsView = connect(stateToProps, dispatchToProps)(_AdminCauseAnalyticsView);
