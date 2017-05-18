import * as r from 'raynor'
import { ExtractError, MarshalFrom, MarshalWith, OptionalOf } from 'raynor'
import { browserHistory } from 'react-router'

import { isLocal } from '@neoncity/common-js'
import { Auth0AccessTokenMarshaller } from '@neoncity/identity-sdk-js'

import * as config from './config'


// Start services here. Will move to a better place later.

class AllowedRoutesMarshaller extends r.AbsolutePathMarshaller {
    filter(path: string): string {
	if (!(path == '/'
	      || path.indexOf('/c/') == 0
	      || path.indexOf('/admin') == 0)) {
	    throw new ExtractError('Expected one of our paths');
	}

	return path;
    }
}

// Generate in a better way. Perhaps something something HMAC to make sure it's one of ours.
class PostLoginRedirectInfo {
    @MarshalWith(AllowedRoutesMarshaller)
    path: string;

    constructor(path: string) {
        this.path = path;
    }
}

class PostLoginRedirectInfoMarshaller extends r.BaseStringMarshaller<PostLoginRedirectInfo> {
    private static readonly _objectMarshaller = new (MarshalFrom(PostLoginRedirectInfo))();

    build(a: string): PostLoginRedirectInfo {
	try {
	    const redirectInfoSer = decodeURIComponent(a);
	    const redirectInfoRaw = JSON.parse(redirectInfoSer);
	    return PostLoginRedirectInfoMarshaller._objectMarshaller.extract(redirectInfoRaw);
	} catch (e) {
            if (isLocal(config.ENV)) {
                console.log(e);
            }
            
	    throw new ExtractError(`Could not build redirect info "${e.toString()}"`);
	}
    }

    unbuild(redirectInfo: PostLoginRedirectInfo) {
	const redirectInfoRaw = PostLoginRedirectInfoMarshaller._objectMarshaller.pack(redirectInfo);
	const redirectInfoSer = JSON.stringify(redirectInfoRaw);
	return encodeURIComponent(redirectInfoSer);
    }
}

export class Auth0RedirectInfo {
    @MarshalWith(OptionalOf(r.StringMarshaller))
    error: string|null;
    
    @MarshalWith(OptionalOf(Auth0AccessTokenMarshaller), 'access_token')
    accessToken: string|null;
    
    @MarshalWith(PostLoginRedirectInfoMarshaller)
    state: PostLoginRedirectInfo;
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
