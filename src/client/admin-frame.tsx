import * as React from 'react'
import { Link } from 'react-router'

import { User } from '@neoncity/identity-sdk-js'


interface Props {
    user: User;
    children: React.ReactNode;
}


export class AdminFrame extends React.Component<Props, undefined> {
    render() {
        return (
            <div>
                <div>This is the admin view</div>
                <Link to="/admin/my-cause">My Cause</Link>
                <Link to="/admin/cause-analytics">Cause Analytics</Link>
                <Link to="/admin/my-actions">My Actions</Link>
                <Link to="/admin/account">Account</Link>
                {this.props.children}
            </div>
        );
    }
}