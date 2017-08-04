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
}


export class PublicCauseWidget extends React.Component<Props, undefined> {
    render() {
        const daysLeft = moment.utc().diff(moment(this.props.cause.deadline), 'days');
        const percentageRaised = 0.5;
        
	return (
            <div className="public-cause-widget">
                <Link to={causeLink(this.props.cause)}>
                    <img
                        className="cause-picture"
                        src={causePictureUri(this.props.cause)}
                        alt={text.causePicture[config.LANG()]} />
                </Link>
                
                <div className="content">
                    <h2 className="title">
                        <Link to={causeLink(this.props.cause)}>{this.props.cause.title}</Link>
                    </h2>
                
                    <p className="status">
                        <span>{commonText.infoOnRaised[config.LANG()](percentageRaised, this.props.cause.goal.amount, this.props.cause.goal.currency)}</span>
                        <span>{commonText.daysLeft[config.LANG()](daysLeft)}</span>
                    </p>

                    <CauseActionsWidget
                        cause={this.props.cause}
                        onNewCause={(_: PublicCause) => { return; }} />
                </div>
	    </div>
	);
    }
}
