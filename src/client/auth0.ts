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
        var _this = this;

        // This generates an async chunk.
        require.ensure([], function(require) {
            const auth0Lock = require('auth0-lock');

            const currentLocation = _this._history.getCurrentLocation();
            const postLoginInfo = new PostLoginRedirectInfo(currentLocation.pathname);
            const postLoginInfoSer = _this._postLoginRedirectInfoMarshaller.pack(postLoginInfo);

            const auth0: any = new ((auth0Lock as any).default)(
                _this._auth0ClientId,
                _this._auth0Domain, {
                    closable: canDismiss,
                    auth: {
                        redirect: true,
                        redirectUrl: _this._auth0CallbackUri,
                        responseType: 'code',
                        params: {
                            state: postLoginInfoSer
                        }
                    }
                }
            );

            auth0.show();
        }, 'auth0-lock');

    }
}
