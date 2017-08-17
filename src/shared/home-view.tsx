import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'

import { PublicCause } from '@neoncity/core-sdk-js'

import * as config from './config'
import { PublicCauseWidget } from './public-cause-widget'
import { OpState, PublicCausesState, StatePart } from '../shared/store'

import * as commonText from './common.text'
import * as text from './home-view.text'


interface HomeViewProps {
    isPreloaded: boolean;
    isLoading: boolean;
    isReady: boolean;
    isFailed: boolean;
    causes: PublicCause[] | null;
    errorMessage: string | null;
    onPublicCausesDonePreload: () => void;
    onPublicCausesLoading: () => void;
    onPublicCausesReady: (causes: PublicCause[]) => void;
    onPublicCausesUpdateOneCause: (cause: PublicCause) => void;
    onPublicCausesFailed: (errorMessage: string) => void;
}


class _HomeView extends React.Component<HomeViewProps, undefined> {
    async componentDidMount() {
        if (this.props.isPreloaded) {
            return;
        }

        this.props.onPublicCausesLoading();

        try {
            const causes = await config.CORE_PUBLIC_CLIENT().getCauses();
            this.props.onPublicCausesReady(causes);
        } catch (e) {
            console.log(e);

            this.props.onPublicCausesFailed('Could not load public causes');
        }
    }

    async componentWillUnmount() {
        this.props.onPublicCausesDonePreload();
    }

    render() {
        const helmet =
            <Helmet>
                <title>{text.pageTitle[config.LANG()]}</title>
                <meta name="description" content={text.pageDescription[config.LANG()]} />
                <meta name="robots" content="index,follow" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={text.pageTitle[config.LANG()]} />
                <meta name="twitter:description" content={text.pageDescription[config.LANG()]} />
                <meta name="twitter:creator" content={commonText.siteName[config.LANG()]} />
                <meta name="twitter:site" content={config.ORIGIN} />
                <meta property="og:url" content={config.ORIGIN} />
                <meta property="og:type" content="article" />
                <meta property="og:title" content={text.pageTitle[config.LANG()]} />
                <meta property="og:description" content={text.pageDescription[config.LANG()]} />
                <meta property="og:site_name" content={commonText.siteName[config.LANG()]} />
                <link rel="canonical" href={config.ORIGIN} />
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
            const causes = (this.props.causes as PublicCause[]).map(
                c => <PublicCauseWidget key={c.id} cause={c} onNewCause={(publicCause: PublicCause) => this.props.onPublicCausesUpdateOneCause(publicCause)} />
            );

            return <div id="home-view">{helmet}{causes}</div>;
        }
    }
}


function stateToProps(state: any) {
    return {
        isPreloaded: state.publicCauses.type == OpState.Preloaded,
        isLoading: state.publicCauses.type == OpState.Init || state.publicCauses.type == OpState.Loading,
        isReady: state.publicCauses.type == OpState.Ready,
        isFailed: state.publicCauses.type == OpState.Failed,
        causes: (state.publicCauses.type == OpState.Ready || state.publicCauses.type == OpState.Preloaded) ? state.publicCauses.causes : null,
        errorMessage: state.publicCauses.type == OpState.Failed ? state.publicCauses.errorMessage : null,
    };
}


function dispatchToProps(dispatch: (newState: PublicCausesState) => void) {
    return {
        onPublicCausesDonePreload: () => dispatch({ part: StatePart.PublicCauses, type: OpState.Init }),
        onPublicCausesLoading: () => dispatch({ part: StatePart.PublicCauses, type: OpState.Loading }),
        onPublicCausesReady: (causes: PublicCause[]) => dispatch({ part: StatePart.PublicCauses, type: OpState.Ready, causes: causes }),
        onPublicCausesUpdateOneCause: (cause: PublicCause) => dispatch({ part: StatePart.PublicCauses, type: OpState.PartialUpdate, causeToUpdate: cause }),
        onPublicCausesFailed: (errorMessage: string) => dispatch({ part: StatePart.PublicCauses, type: OpState.Failed, errorMessage: errorMessage })
    };
}


export const HomeView = connect(stateToProps, dispatchToProps)(_HomeView);
