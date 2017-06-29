import * as React from 'react'
import { Link } from 'react-router'

import * as config from './config'

import * as text from './admin-frame.text'
import * as commonText from './common.text'


interface Props {
    children: React.ReactNode;
}


export class AdminFrame extends React.Component<Props, undefined> {
    render() {
        return (
            <div>
                <div>{text.viewTitle[config.LANG()]}</div>
                <Link to="/admin/my-cause">{commonText.adminMyCause[config.LANG()]}</Link>
                <Link to="/admin/cause-analytics">{commonText.adminCauseAnalytics[config.LANG()]}</Link>
                <Link to="/admin/my-actions">{commonText.adminMyActions[config.LANG()]}</Link>
                <Link to="/admin/account">{commonText.adminAccount[config.LANG()]}</Link>
                {this.props.children}
            </div>
        );
    }
}
