import * as React from 'react'
import { Helmet } from 'react-helmet'
import * as ReactMarkdown from 'react-markdown'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import { PublicCause } from '@neoncity/core-sdk-js'

import { CauseActionsWidget } from './cause-actions-widget'
import * as config from './config'
import { OpState, PublicCauseDetailState, StatePart } from '../shared/store'
import { causeLink, causePictureUri } from './utils'

import * as text from './cause-view.text'
import * as commonText from './common.text'

const moment = require('moment')


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
    cause: PublicCause | null;
    errorMessage: string | null;
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
            console.log(e);

            this.props.onPublicCauseDetailFailed('Could not load public cause detail');
        }
    }

    async componentWillUnmount() {
        this.props.onPublicCauseDetailDonePreload();
    }

    render() {
        const cause = this.props.cause as PublicCause;

        const pageTitle: string = this.props.isReady || this.props.isPreloaded
            ? text.pageTitle[config.LANG()](cause.title)
            : text.pageTitleDefault[config.LANG()];

        const pageDescription: string = this.props.isReady || this.props.isPreloaded
            ? text.pageDescription[config.LANG()](cause.description)
            : text.pageDescriptionDefault[config.LANG()];

        const realCauseLink: string = this.props.isReady || this.props.isPreloaded
            ? `${config.ORIGIN}${causeLink(cause)}`
            : config.ORIGIN;

        const helmet =
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="robots" content="index,follow" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={causePictureUri(cause)} />
                <meta name="twitter:creator" content={commonText.siteName[config.LANG()]} />
                <meta name="twitter:site" content={config.ORIGIN} />
                <meta property="og:url" content={realCauseLink} />
                <meta property="og:type" content="article" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:site_name" content={commonText.siteName[config.LANG()]} />
                <meta property="og:image" content={causePictureUri(cause)} />
                <link rel="canonical" href={realCauseLink} />
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
            const cause = this.props.cause as PublicCause;

            const daysLeft = moment.utc().diff(moment(cause.deadline), 'days');
            const percentageRaised = 0.5;

            return (
                <div id="cause-view">
                    {helmet}

                    <div id="cause-view-head-region">

                        <div id="cause-view-gallery">
                            <img
                                className="cause-picture"
                                src={causePictureUri(cause)}
                                alt={text.causePicture[config.LANG()]} />
                        </div>

                        <div id="cause-view-controls">
                            <div className="content">
                                <h2>{cause.title}</h2>

                                <p className="status">
                                    <span>{commonText.infoOnRaised[config.LANG()](percentageRaised, cause.goal.amount, cause.goal.currency)}</span>
                                    <span>{commonText.daysLeft[config.LANG()](daysLeft)}</span>
                                </p>

                                <CauseActionsWidget
                                    cause={cause}
                                    onNewCause={(_: PublicCause) => { return; }} />
                            </div>
                        </div>

                    </div>

                    <div id="cause-view-description">
                        <ReactMarkdown
                            escapeHtml={true}
                            disallowedTypes={['Image', 'Code', 'CodeBlock']}
                            source={cause.description} />
                    </div>
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
        onPublicCauseDetailDonePreload: () => dispatch({ part: StatePart.PublicCauseDetail, type: OpState.Init }),
        onPublicCauseDetailLoading: () => dispatch({ part: StatePart.PublicCauseDetail, type: OpState.Loading }),
        onPublicCauseDetailReady: (cause: PublicCause) => dispatch({ part: StatePart.PublicCauseDetail, type: OpState.Ready, cause: cause }),
        onPublicCauseDetailFailed: (errorMessage: string) => dispatch({ part: StatePart.PublicCauseDetail, type: OpState.Failed, errorMessage: errorMessage })
    };
}


export const CauseView = connect(stateToProps, dispatchToProps)(_CauseView);
