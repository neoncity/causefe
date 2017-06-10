import Auth0Lock from 'auth0-lock'
import { History } from 'history'

import { Auth0Client } from '../shared/auth0'
import { PostLoginRedirectInfo, PostLoginRedirectInfoMarshaller } from '../shared/auth-flow'


export class Auth0Service implements Auth0Client {
    private readonly _postLoginRedirectInfoMarshaller: PostLoginRedirectInfoMarshaller;
    private readonly _history: History;
    private readonly _auth0ClientId: string;
    private readonly _auth0Domain: string;
    private readonly _auth0CallbackUri: string;

    constructor(history: History, auth0ClientId: string, auth0Domain: string, auth0CallbackUri: string) {
        this._postLoginRedirectInfoMarshaller = new PostLoginRedirectInfoMarshaller();
        this._history = history;
        this._auth0ClientId = auth0ClientId;
        this._auth0Domain = auth0Domain;
        this._auth0CallbackUri = auth0CallbackUri;
    }
    
    showLock(canDismiss: boolean = true): void {
        const currentLocation = this._history.getCurrentLocation();
        const postLoginInfo = new PostLoginRedirectInfo(currentLocation.pathname);
        const postLoginInfoSer = this._postLoginRedirectInfoMarshaller.pack(postLoginInfo);

        const auth0: Auth0LockStatic = new Auth0Lock(
	    this._auth0ClientId,
	    this._auth0Domain, {
                closable: canDismiss,
                auth: {
		    redirect: true,
		    redirectUrl: this._auth0CallbackUri,
		    responseType: 'code',
		    params: {
                        state: postLoginInfoSer
		    }
                }
	    }
        );

        auth0.show();        
    }
}
