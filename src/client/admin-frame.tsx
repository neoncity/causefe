import * as React from 'react'
import { Link } from 'react-router'

import { LANG } from './from-server'

import * as text from './admin-frame.text'


interface Props {
    children: React.ReactNode;
}


export class AdminFrame extends React.Component<Props, undefined> {
    render() {
        return (
            <div>
                <div>{text.viewTitle[LANG]}</div>
                <Link to="/admin/my-cause">{text.myCause[LANG]}</Link>
                <Link to="/admin/cause-analytics">{text.causeAnalytics[LANG]}</Link>
                <Link to="/admin/my-actions">{text.myActions[LANG]}</Link>
                <Link to="/admin/account">{text.account[LANG]}</Link>
                {this.props.children}
            </div>
        );
    }
}
