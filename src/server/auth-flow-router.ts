import { wrap } from 'async-middleware'
import * as express from 'express'
import 'isomorphic-fetch'
import * as HttpStatus from 'http-status-codes'
import { MarshalFrom, MarshalWith, OptionalOf } from 'raynor'

import { isLocal, WebFetcher } from '@neoncity/common-js'
import {
    AuthInfoLevel,
    newAuthInfoMiddleware,
    newSessionMiddleware,
    SessionLevel
} from '@neoncity/common-server-js'
import {
    Auth0AccessTokenMarshaller,
    Auth0AuthorizationCodeMarshaller,
    AuthInfo,
    IdentityClient,
    Session
} from '@neoncity/identity-sdk-js'

import { CauseFeRequest } from './causefe-request'
import * as config from '../shared/config'
import { PostLoginRedirectInfo, PostLoginRedirectInfoMarshaller } from '../shared/auth-flow'


export class Auth0AuthorizeRedirectInfo {
    @MarshalWith(OptionalOf(Auth0AuthorizationCodeMarshaller), 'code')
    authorizationCode: string | null;

    @MarshalWith(PostLoginRedirectInfoMarshaller)
    state: PostLoginRedirectInfo;
}


export class Auth0TokenExchangeResult {
    @MarshalWith(Auth0AccessTokenMarshaller, 'access_token')
    accessToken: string;
}


const AUTHORIZE_OPTIONS: RequestInit = {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    redirect: 'error',
    referrer: 'client',
    headers: {
        'Content-Type': 'application/json'
    }
};

export function newAuthFlowRouter(webFetcher: WebFetcher, identityClient: IdentityClient): express.Router {
    const authInfoMarshaller = new (MarshalFrom(AuthInfo))();
    const auth0TokenExchangeResultMarshaller = new (MarshalFrom(Auth0TokenExchangeResult))();
    const auth0AuthorizeRedirectInfoMarshaller = new (MarshalFrom(Auth0AuthorizeRedirectInfo))();

    const authFlowRouter = express.Router();

    authFlowRouter.use(newAuthInfoMiddleware(AuthInfoLevel.SessionId));
    authFlowRouter.use(newSessionMiddleware(SessionLevel.Session, identityClient))

    authFlowRouter.get('/login', wrap(async (req: CauseFeRequest, res: express.Response) => {
        let redirectInfo: Auth0AuthorizeRedirectInfo | null = null;
        try {
            redirectInfo = auth0AuthorizeRedirectInfoMarshaller.extract(req.query);
        } catch (e) {
            console.log(`Auth error - ${e.toString()}`);
            console.log(e);

            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            res.end();
            return;
        }

        const options = (Object as any).assign({}, AUTHORIZE_OPTIONS, {
            body: JSON.stringify({
                grant_type: 'authorization_code',
                client_id: config.AUTH0_CLIENT_ID,
                client_secret: config.AUTH0_CLIENT_SECRET,
                code: redirectInfo.authorizationCode,
                redirect_uri: config.AUTH0_CALLBACK_URI
            })
        });

        let rawResponse: Response;
        try {
            rawResponse = await webFetcher.fetch(`https://${config.AUTH0_DOMAIN}/oauth/token`, options);
        } catch (e) {
            console.log(`Auth service error - ${e.toString()}`);
            console.log(e);

            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            res.end();
            return;
        }

        let auth0TokenExchangeResult: Auth0TokenExchangeResult | null = null;
        if (rawResponse.ok) {
            try {
                const jsonResponse = await rawResponse.json();
                auth0TokenExchangeResult = auth0TokenExchangeResultMarshaller.extract(jsonResponse);
            } catch (e) {
                console.log(`Deserialization error - ${e.toString()}`);
                console.log(e);

                res.status(HttpStatus.INTERNAL_SERVER_ERROR);
                res.end();
                return;
            }
        } else {
            console.log('Auth error');
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            res.end();
            return;
        }

        let authInfo = new AuthInfo((req.authInfo as AuthInfo).sessionId, auth0TokenExchangeResult.accessToken);

        try {
            authInfo = (await identityClient.withContext(authInfo).getOrCreateUserOnSession(req.session as Session))[0];
        } catch (e) {
            console.log(`Session creation error - ${e.toString()}`);
            console.log(e.stacktrace);

            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            res.end();
            return;
        }

        res.cookie(AuthInfo.CookieName, authInfoMarshaller.pack(authInfo), {
            expires: (req.session as Session).timeExpires,
            httpOnly: true,
            secure: !isLocal(config.ENV)
        });

        res.redirect(redirectInfo.state.path);
    }));

    authFlowRouter.get('/logout', wrap(async (req: CauseFeRequest, res: express.Response) => {
        try {
            await identityClient.withContext(req.authInfo as AuthInfo).expireSession(req.session as Session);
        } catch (e) {
            console.log(`Session expiration error - ${e.toString()}`);
            console.log(e);

            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            res.end();
            return;
        }

        res.clearCookie(AuthInfo.CookieName, { httpOnly: true, secure: !isLocal(config.ENV) });
        res.redirect('/');
    }));

    return authFlowRouter;
}
