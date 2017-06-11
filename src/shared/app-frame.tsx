import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import { Session } from '@neoncity/identity-sdk-js'

import * as config from './config'
import { UserInfoWidget } from './user-info-widget'

import * as text from './app-frame.text'


interface Props {
    session: Session;
    children: React.ReactNode;
}


class _AppFrame extends React.Component<Props, undefined> {
    render() {
	// Bit of a hack. If there's no user, the global navigation to admin and console is done through a regular <a> tag
	// which will trigger a page load event. This is not so bad, as the login flow is beefy as it is, but it does add
	// _some_ extra complexity. Hopefully it will be easy to get rid of in the future.
        if (!this.props.session.hasUser()) {
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


function stateToProps(state: any) {
    return {
	session: state.request.session,
    };
}


function dispatchToProps(_: (newState: any) => void) {
    return {};
}


export const AppFrame = connect(stateToProps, dispatchToProps)(_AppFrame);
