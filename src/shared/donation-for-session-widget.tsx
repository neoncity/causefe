import * as React from 'react'
import { Link } from 'react-router'

import { DonationForSession } from '@neoncity/core-sdk-js'

import * as config from './config'
import { causeLink } from './utils'

import * as text from './donation-for-session-widget.text'


interface Props {
    donationForSession: DonationForSession;
}


export class DonationForSessionWidget extends React.Component<Props, null> {
    render() {
        const donation = this.props.donationForSession;
        const cause = this.props.donationForSession.forCause;
        const timeCreated = donation.timeCreated.toUTCString();

        return (
            <p className="donation-for-session-widget">
                <span>{text.donated[config.LANG()](donation.amount, cause.title, timeCreated)}</span>
                <Link to={causeLink(cause)}>{text.details[config.LANG()]}</Link>
            </p>
        );
    }
}
