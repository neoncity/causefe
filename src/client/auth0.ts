import Auth0Lock from 'auth0-lock'
import { browserHistory } from 'react-router'

import * as config from './config'

import { PostLoginRedirectInfo, PostLoginRedirectInfoMarshaller } from '../shared/auth-flow'

const postLoginRedirectInfoMarshaller = new PostLoginRedirectInfoMarshaller();


export function showAuth0Lock(canDismiss: boolean = true) {
    const currentLocation = browserHistory.getCurrentLocation();
    const postLoginInfo = new PostLoginRedirectInfo(currentLocation.pathname);
    const postLoginInfoSer = postLoginRedirectInfoMarshaller.pack(postLoginInfo);

    const auth0: Auth0LockStatic = new Auth0Lock(
	config.AUTH0_CLIENT_ID,
	config.AUTH0_DOMAIN, {
            closable: canDismiss,
            auth: {
		redirect: true,
		redirectUrl: config.AUTH0_CALLBACK_URI,
		responseType: 'code',
		params: {
                    state: postLoginInfoSer
		}
            }
	}
    );

    auth0.show();
}
