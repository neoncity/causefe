import * as React from 'react'
import { Link } from 'react-router'

import * as config from './config'

import * as commonText from './common.text'


interface Props {
    children: React.ReactNode;
}


export class AdminFrame extends React.Component<Props, undefined> {
    render() {
        return (
            <div id="admin-frame-body">
                <div id="admin-sidebar-menu">
                    <div className="actions">
                        <span>
                            <span className="menu-icon my-cause"></span>
                            <Link to="/admin/my-cause">
                                {commonText.adminMyCause[config.LANG()]}
                            </Link>
                        </span>
                        <span>
                            <span className="menu-icon cause-analytics"></span>
                            <Link to="/admin/cause-analytics">
                                {commonText.adminCauseAnalytics[config.LANG()]}
                            </Link>
                        </span>
                        <span>
                            <span className="menu-icon my-actions"></span>
                            <Link to="/admin/my-actions">
                                {commonText.adminMyActions[config.LANG()]}
                            </Link>
                        </span>
                        <span>
                            <span className="menu-icon account"></span>
                            <Link to="/admin/account">
                                {commonText.adminAccount[config.LANG()]}
                            </Link>
                        </span>
                    </div>                
                </div>
                <div id="admin-content">
                    {this.props.children}
                </div>
            </div>
        );
    }
}
