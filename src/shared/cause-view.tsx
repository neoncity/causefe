import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import { PublicCause } from '@neoncity/core-sdk-js'
import { isLocal } from '@neoncity/common-js'

import * as config from './config'
import { PublicCauseWidget } from './public-cause-widget'
import { OpState, PublicCauseDetailState, StatePart } from '../shared/store'
import { causeLink } from './utils'

import * as text from './cause-view.text'
import * as commonText from './common.text'


interface Params {
    causeId: string;
    causeSlug: string;
}


interface Props {
    isPreloaded: boolean;
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    params: Params;
    cause: PublicCause|null;
    errorMessage: string|null;
    onPublicCauseDetailDonePreload: () => void;
    onPublicCauseDetailLoading: () => void;
    onPublicCauseDetailReady: (cause: PublicCause) => void;
    onPublicCauseDetailFailed: (errorMessage: string) => void;
}


class _CauseView extends React.Component<Props, undefined> {
    async componentDidMount() {
        if (this.props.isPreloaded) {
            return;
        }
        
	this.props.onPublicCauseDetailLoading();

        try {
            const causeId = parseInt(this.props.params.causeId);
            const cause = await config.CORE_PUBLIC_CLIENT().getCause(causeId);
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

    async componentWillUnmount() {
        this.props.onPublicCauseDetailDonePreload();
    }    
    
    render() {
        const cause = this.props.cause as PublicCause;
        
        const pageTitle = this.props.isReady || this.props.isPreloaded
              ? text.pageTitle[config.LANG()](cause.title)
              : text.pageTitleDefault[config.LANG()];

        const pageDescription: string = this.props.isReady || this.props.isPreloaded
              ? text.pageDescription[config.LANG()](cause.description)
              : text.pageDescriptionDefault[config.LANG()];
        
        const helmet =
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={`${config.ORIGIN}${causeLink(cause)}`} />
            </Helmet>;
        
        if (this.props.isLoading) {
            return <div>{helmet}{commonText.loading[config.LANG()]}</div>;
        } else if (this.props.isFailed) {
            return <div>{helmet}{commonText.loadingFailed[config.LANG()]}</div>;
        } else {
            return (
                <div>
                    {helmet}
                    <PublicCauseWidget cause={this.props.cause as PublicCause} />
                </div>
            );
        }
    }
}


function stateToProps(state: any) {
    return {
        isPreloaded: state.publicCauseDetail.type == OpState.Preloaded,
	isLoading: state.publicCauseDetail.type == OpState.Init || state.publicCauseDetail.type == OpState.Loading,
	isReady: state.publicCauseDetail.type == OpState.Ready,
	isFailed: state.publicCauseDetail.type == OpState.Failed,
	cause: (state.publicCauseDetail.type == OpState.Ready || state.publicCauseDetail.type == OpState.Preloaded) ? state.publicCauseDetail.cause : null,
	errorMessage: state.publicCauseDetail.type == OpState.Failed ? state.publicCauseDetail.errorMessage : null,
    };
}


function dispatchToProps(dispatch: (newState: PublicCauseDetailState) => void) {
    return {
        onPublicCauseDetailDonePreload: () => dispatch({part: StatePart.PublicCauseDetail, type: OpState.Init}),
	onPublicCauseDetailLoading: () => dispatch({part: StatePart.PublicCauseDetail, type: OpState.Loading}),
	onPublicCauseDetailReady: (cause: PublicCause) => dispatch({part: StatePart.PublicCauseDetail, type: OpState.Ready, cause: cause}),
	onPublicCauseDetailFailed: (errorMessage: string) => dispatch({part: StatePart.PublicCauseDetail, type: OpState.Failed, errorMessage: errorMessage})
    };
}


export const CauseView = connect(stateToProps, dispatchToProps)(_CauseView);
