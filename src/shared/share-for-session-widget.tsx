import * as React from 'react'
import { Link } from 'react-router'

import { ShareForSession } from '@neoncity/core-sdk-js'

import * as config from './config'
import { causeLink } from './utils'

import * as text from './share-for-session-widget.text'


interface Props {
    shareForSession: ShareForSession;
}


export class ShareForSessionWidget extends React.Component<Props, null> {
    render() {
        const share = this.props.shareForSession;
        const cause = this.props.shareForSession.forCause;
        const timeCreated = share.timeCreated.toUTCString();

        return (
            <p>
                <span>{text.shared[config.LANG()](cause.title, timeCreated)}</span>
                <Link to={causeLink(cause)}>{text.details[config.LANG()]}}</Link>
            </p>
        );
    }
}
