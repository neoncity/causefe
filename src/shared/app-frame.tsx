import * as React from 'react'
import { Link } from 'react-router'

import * as config from './config'
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
        if (!config.SESSION().hasUser()) {
            return (
                <div>
                    <div>{text.viewTitle[config.LANG()]}</div>
                    <div>
                        <Link to="/">{text.home[config.LANG()]}</Link>
                        <a href="/admin">{text.admin[config.LANG()]}</a>
                        <UserInfoWidget />
                    </div>
                    {this.props.children}
                </div>
            );
        } else {
            return (
                <div>
                    <div>{text.viewTitle[config.LANG()]}</div>
                    <div>
                        <Link to="/">{text.home[config.LANG()]}</Link>
                        <Link to="/admin">{text.admin[config.LANG()]}</Link>
                        <UserInfoWidget />
                    </div>
                    {this.props.children}
                </div>
            );      
        }
    }
}
