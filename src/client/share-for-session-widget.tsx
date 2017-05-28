import * as React from 'react'
import { Link } from 'react-router'

import { ShareForSession } from '@neoncity/core-sdk-js'

import { causeLink } from './utils'


interface Props {
    shareForSession: ShareForSession;
}


export class ShareForSessionWidget extends React.Component<Props, null> {
    render() {
	const share = this.props.shareForSession;
	const cause = this.props.shareForSession.forCause;
	const timeCreated = share.timeCreated.toString();
	
	return (
             <p>To <Link to={causeLink(cause)}>{cause.title}</Link> shared on {timeCreated}</p>
	);
    }
}
