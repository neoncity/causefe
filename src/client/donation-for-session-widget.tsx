import * as React from 'react'
import { Link } from 'react-router'

import { DonationForSession } from '@neoncity/core-sdk-js'

import { LANG } from './from-server'
import { causeLink } from './utils'

import * as text from './donation-for-session-widget.text'


interface Props {
    donationForSession: DonationForSession;
}


export class DonationForSessionWidget extends React.Component<Props, null> {
    render() {
	const donation = this.props.donationForSession;
	const cause = this.props.donationForSession.forCause;
	const timeCreated = donation.timeCreated.toString();

	return <p>{text.donated[LANG](donation.amount, cause.title, timeCreated)} <Link to={causeLink(cause)}>{text.details[LANG]}</Link></p>
    }
}
