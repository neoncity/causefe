import * as React from 'react'
import { Link } from 'react-router'

import { DonationForUser } from '@neoncity/core-sdk-js'

import { causeLink } from './utils'


interface Props {
    donationForUser: DonationForUser;
}


export class DonationForUserWidget extends React.Component<Props, null> {
    render() {
	const donation = this.props.donationForUser;
	const cause = this.props.donationForUser.forCause;
	const timeCreated = donation.timeCreated.toString();
	
	return <p>To <Link to={causeLink(cause)}>{cause.title}</Link> donated {donation.amount.amount} {donation.amount.currency.toString()} on {timeCreated}</p>;
    }
}