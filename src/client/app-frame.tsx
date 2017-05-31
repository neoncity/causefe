import * as React from 'react'
import { Link } from 'react-router'


import { LANG, SESSION } from './from-server'
import { UserInfoWidget } from './user-info-widget'

import * as text from './app-frame.text'


interface Props {
    children: React.ReactNode;
}


export class AppFrame extends React.Component<Props, undefined> {
    render() {
	// Bit of a hack. If there's no user, the global navigation to admin and console is done through a regular <a> tag
	// which will trigger a page load event. This is not so bad, as the login flow is beefy as it is, but it does add
	// _some_ extra complexity. Hopefully it will be easy to get rid of in the future.
        if (!SESSION.hasUser()) {
            return (
                <div>
                    <div>{text.viewTitle[LANG]}</div>
                    <div>
                        <Link to="/">{text.home[LANG]}</Link>
                        <a href="/admin">{text.admin[LANG]}</a>
                        <UserInfoWidget />
                    </div>
                    {this.props.children}
                </div>
            );
        } else {
            return (
                <div>
                    <div>{text.viewTitle[LANG]}</div>
                    <div>
                        <Link to="/">{text.home[LANG]}</Link>
                        <Link to="/admin">{text.admin[LANG]}</Link>
                        <UserInfoWidget />
                    </div>
                    {this.props.children}
                </div>
            );      
        }
    }
}

