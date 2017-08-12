import { wrap } from 'async-middleware'
import * as express from 'express'
import * as HttpStatus from 'http-status-codes'
import { MarshalFrom } from 'raynor'

import { Env, isLocal } from '@neoncity/common-js'
import { AuthInfo, IdentityClient } from '@neoncity/identity-sdk-js'

import { CauseFeRequest } from './causefe-request'


export function newEnsureSessionMiddleware(env: Env, identityClient: IdentityClient) {
    const authInfoMarshaller = new (MarshalFrom(AuthInfo))();

    return wrap(async (req: CauseFeRequest, res: express.Response, next: express.NextFunction) => {
        if (req.authInfo == null || req.session == null) {
            try {
                const [authInfo, session] = await identityClient.getOrCreateSession();
                req.authInfo = authInfo;
                req.session = session;

                res.cookie(AuthInfo.CookieName, authInfoMarshaller.pack(authInfo), {
                    expires: session.timeExpires,
                    httpOnly: true,
                    secure: !isLocal(env)
                });
            } catch (e) {
                console.log(`Session creation error - ${e.toString()}`);
                console.log(e);

                res.status(HttpStatus.INTERNAL_SERVER_ERROR);
                res.end();
                return;
            }
        }

        // Fire away.
        next();
    });
}
