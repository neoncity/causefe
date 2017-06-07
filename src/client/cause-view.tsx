import * as React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import { PublicCause } from '@neoncity/core-sdk-js'
import { isLocal } from '@neoncity/common-js'

import * as config from './config'
import { LANG } from './from-server'
import { PublicCauseWidget } from './public-cause-widget'
import { corePublicClient } from './services'
import { OpState, PublicCauseDetailState, StatePart } from '../shared/store'
import { causeLink } from './utils'

import * as commonText from './common.text'


interface Params {
    causeId: string;
    causeSlug: string;
}


interface Props {
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    params: Params;
    cause: PublicCause|null;
    errorMessage: string|null;
    onPublicCauseDetailLoading: () => void;
    onPublicCauseDetailReady: (cause: PublicCause) => void;
    onPublicCauseDetailFailed: (errorMessage: string) => void;
}


class _CauseView extends React.Component<Props, undefined> {
    async componentDidMount() {
	this.props.onPublicCauseDetailLoading();

        try {
            const causeId = parseInt(this.props.params.causeId);
            const cause = await corePublicClient.getCause(causeId);
            this.props.onPublicCauseDetailReady(cause);
            // Also update the URL to be causeLink(cause), but it should do no navigation.
            // Users might access this as /c/$id/$firstSlug, but the actual slug assigned
            // might be $secondSlog. So we wish to replace the one they specified with
            // /c/$id/$secondSlug
            browserHistory.replace(causeLink(cause));
        } catch (e) {
            if (isLocal(config.ENV)) {
                console.log(e);
            }
            
            this.props.onPublicCauseDetailFailed('Could not load public cause detail');
        }
    }
    
    render() {
        if (this.props.isLoading) {
            return <div>{commonText.loading[LANG]}</div>;
        } else if (this.props.isFailed) {
            return <div>{commonText.loadingFailed[LANG]}</div>;
        } else {
            return (
                <PublicCauseWidget cause={this.props.cause as PublicCause} />
            );
        }
    }
}


function stateToProps(state: any) {
    return {
	isLoading: state.publicCauseDetail.type == OpState.Init || state.publicCauseDetail.type == OpState.Loading,
	isReady: state.publicCauseDetail.type == OpState.Ready,
	isFailed: state.publicCauseDetail.type == OpState.Failed,
	cause: state.publicCauseDetail.type == OpState.Ready ? state.publicCauseDetail.cause : null,
	errorMessage: state.publicCauseDetail.type == OpState.Failed ? state.publicCauseDetail.errorMessage : null,
    };
}


function dispatchToProps(dispatch: (newState: PublicCauseDetailState) => void) {
    return {
	onPublicCauseDetailLoading: () => dispatch({part: StatePart.PublicCauseDetail, type: OpState.Loading}),
	onPublicCauseDetailReady: (cause: PublicCause) => dispatch({part: StatePart.PublicCauseDetail, type: OpState.Ready, cause: cause}),
	onPublicCauseDetailFailed: (errorMessage: string) => dispatch({part: StatePart.PublicCauseDetail, type: OpState.Failed, errorMessage: errorMessage})
    };
}


export const CauseView = connect(stateToProps, dispatchToProps)(_CauseView);
