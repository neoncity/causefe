import * as classNames from 'classnames'
import * as React from 'react'
import { Link } from 'react-router'

import { User } from '@neoncity/identity-sdk-js'

import * as config from './config'

import * as commonText from './common.text'
import * as text from './user-info-widget.text'


interface Props {
}


interface State {
    showMenu: boolean;
}


export class UserInfoWidget extends React.Component<Props, State> {
    constructor(props: Props) {
	super(props);
	this.state = {
	    showMenu: false
	};
    }
    
    render() {
	let menu = <span></span>;
	if (this.state.showMenu) {
	    menu =
		<div>
                    <Link to="/admin">{commonText.admin[config.LANG()]}</Link>
		    <Link to="/admin/my-actions">{commonText.adminMyActions[config.LANG()]}</Link>
		    <Link to="/admin/account">{commonText.adminAccount[config.LANG()]}</Link>
		    <button
		        className="action"
		        onClick={this._handleLogoutClick.bind(this)}>
		        {text.logout[config.LANG()]}
   		    </button>
		</div>;
	}
	
        const session = config.SESSION();
	if (session.hasUser()) {
	    return (
                <div>
		    <img
		        className="profile-picture"
		        src={(session.user as User).pictureUri}
		        alt={text.pictureOf[config.LANG()]((session.user as User).name)} />
                    <button
		        className={classNames('menu', {open: this.state.showMenu, closed: !this.state.showMenu})}
		        onClick={this._handleShowMenuClick.bind(this)}>
		    </button>
		    {menu}
                </div>
            );
	} else {
	    return (
                <div>
                    <a
                        href="#"
                        className="auth-button"
                        onClick={this._handleLoginClick.bind(this)}>
                        {text.login[config.LANG()]}
                    </a>
                </div>
            );
	}
    }

    private _handleLogoutClick() {
        location.replace(config.LOGOUT_ROUTE);
    }

    private _handleLoginClick() {
        config.AUTH0_CLIENT().showLock(true);
    }

    private _handleShowMenuClick() {
	this.setState({showMenu: !this.state.showMenu});
    }
}
