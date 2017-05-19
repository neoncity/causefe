import * as React from 'react'
import { Link } from 'react-router'

import { ShareForUser } from '@neoncity/core-sdk-js'

import { causeLink } from './utils'


interface Props {
    shareForUser: ShareForUser;
}


export class ShareForUserWidget extends React.Component<Props, null> {
    render() {
	const share = this.props.shareForUser;
	const cause = this.props.shareForUser.forCause;
	const timeCreated = share.timeCreated.toString();
	
	return (
             <p>To <Link to={causeLink(cause)}>{cause.title}</Link> shared on {timeCreated}</p>
	);
    }
}
