import * as React from 'react'
import { connect } from 'react-redux'

import { CorePublicClient, PublicCause } from '@neoncity/core-sdk-js'
import { isLocal } from '@neoncity/common-js'

import * as config from './config'
import { PublicCauseWidget } from './public-cause-widget'
import { OpState, PublicCausesState, StatePart } from '../shared/store'

import * as commonText from './common.text'


interface HomeViewProps {
    corePublicClient: CorePublicClient;
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
	    const causes = await this.props.corePublicClient.getCauses();
	    this.props.onPublicCausesReady(causes);
	} catch (e) {
            if (isLocal(config.ENV)) {
                console.log(e);
            }
            
	    this.props.onPublicCausesFailed('Could not load public causes');
	}
    }
    
    render() {
	if (this.props.isLoading) {
	    return <div>{commonText.loading[config.LANG]}</div>;
	} else if (this.props.isFailed) {
	    return <div>{commonText.loadingFailed[config.LANG]}</div>;
	} else {
	    const causes = (this.props.causes as PublicCause[]).map(
	        c => <PublicCauseWidget
		    key={c.id}
		    corePublicClient={this.props.corePublicClient}
		    cause={c} />
	    );
	    
	    return <div>{causes}</div>;
	}
    }
}


function stateToProps(state: any) {
    return {
	corePublicClient: state.request.services != null ? state.request.services.corePublicClient : null,
	isLoading: state.publicCauses.type == OpState.Init || state.publicCauses.type == OpState.Loading,
	isReady: state.publicCauses.type == OpState.Ready,
	isFailed: state.publicCauses.type == OpState.Failed,
	causes: state.publicCauses.type == OpState.Ready ? state.publicCauses.causes : null,
	errorMessage: state.publicCauses.type == OpState.Failed ? state.publicCauses.errorMessage : null,
    };
}


function dispatchToProps(dispatch: (newState: PublicCausesState) => void) {
    return {
	onPublicCausesLoading: () => dispatch({part: StatePart.PublicCauses, type: OpState.Loading}),
	onPublicCausesReady: (causes: PublicCause[]) => dispatch({part: StatePart.PublicCauses, type: OpState.Ready, causes: causes}),
	onPublicCausesFailed: (errorMessage: string) => dispatch({part: StatePart.PublicCauses, type: OpState.Failed, errorMessage: errorMessage})
    };
}


export const HomeView = connect(stateToProps, dispatchToProps)(_HomeView);
