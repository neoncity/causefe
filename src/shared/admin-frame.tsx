import * as React from 'react'
import { Link } from 'react-router'

import * as config from './config'

import * as text from './admin-frame.text'


interface Props {
    children: React.ReactNode;
}


export class AdminFrame extends React.Component<Props, undefined> {
    render() {
        return (
            <div>
                <div>{text.viewTitle[config.LANG()]}</div>
                <Link to="/admin/my-cause">{text.myCause[config.LANG()]}</Link>
                <Link to="/admin/cause-analytics">{text.causeAnalytics[config.LANG()]}</Link>
                <Link to="/admin/my-actions">{text.myActions[config.LANG()]}</Link>
                <Link to="/admin/account">{text.account[config.LANG()]}</Link>
                {this.props.children}
            </div>
        );
    }
}
