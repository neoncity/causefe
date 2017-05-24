import Auth0Lock from 'auth0-lock'
import { MarshalWith, OptionalOf } from 'raynor'
import { browserHistory } from 'react-router'

import {
    Auth0AuthorizationCodeMarshaller,
    Auth0AccessTokenMarshaller } from '@neoncity/identity-sdk-js'

import * as config from './config'

import { PostLoginRedirectInfo, PostLoginRedirectInfoMarshaller } from '../shared/auth-flow'


export class Auth0AuthorizeRedirectInfo {
    @MarshalWith(OptionalOf(Auth0AuthorizationCodeMarshaller), 'code')
    authorizationCode: string|null;

    @MarshalWith(PostLoginRedirectInfoMarshaller)
    state: PostLoginRedirectInfo;
}



export class Auth0ExchangeTokenRedirectInfo {
    @MarshalWith(OptionalOf(Auth0AccessTokenMarshaller), 'access_token')
    accessToken: string|null;
}


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
		responseType: 'token',
		params: {
                    state: postLoginInfoSer
		}
            }
	}
    );

    auth0.show();
}
