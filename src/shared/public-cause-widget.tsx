import * as React from 'react'
import { Link } from 'react-router'

import { PublicCause } from '@neoncity/core-sdk-js'

import { CauseActionsWidget } from './cause-actions-widget'
import * as config from './config'
import { causeLink, causePictureUri } from './utils'

import * as commonText from './common.text'
import * as text from './public-cause-widget.text'

const moment = require('moment')


interface Props {
    cause: PublicCause;
    onNewCause: (publicCause: PublicCause) => void;
}


export class PublicCauseWidget extends React.Component<Props, {}> {
    render() {
        const cause: PublicCause = this.props.cause;
        const daysLeft = moment.utc().diff(moment(cause.deadline), 'days');
        const percentageRaised = cause.quickAnalytics.amountDonated.amount / cause.goal.amount;

        return (
            <div className="public-cause-widget">
                <Link to={causeLink(cause)}>
                    <img
                        className="cause-picture"
                        src={causePictureUri(cause)}
                        alt={text.causePicture[config.LANG()]} />
                </Link>

                <div className="content">
                    <h2 className="title">
                        <Link to={causeLink(cause)}>{cause.title}</Link>
                    </h2>

                    <p className="status">
                        <span>{commonText.infoOnRaised[config.LANG()](percentageRaised, cause.goal.amount, cause.goal.currency)}</span>
                        <span>{commonText.daysLeft[config.LANG()](daysLeft)}</span>

                        <img
                            className="owner-picture"
                            src={cause.user.pictureUri}
                            alt={cause.user.name} />
                    </p>

                    <CauseActionsWidget
                        cause={cause}
                        onNewCause={(publicCause: PublicCause) => this.props.onNewCause(publicCause)} />
                </div>
            </div>
        );
    }
}
