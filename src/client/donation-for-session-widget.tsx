import * as React from 'react'
import { Link } from 'react-router'

import { DonationForSession } from '@neoncity/core-sdk-js'

import { causeLink } from './utils'


interface Props {
    donationForSession: DonationForSession;
}


export class DonationForSessionWidget extends React.Component<Props, null> {
    render() {
	const donation = this.props.donationForSession;
	const cause = this.props.donationForSession.forCause;
	const timeCreated = donation.timeCreated.toString();
	
	return <p>To <Link to={causeLink(cause)}>{cause.title}</Link> donated {donation.amount.amount} {donation.amount.currency.toString()} on {timeCreated}</p>;
    }
}
