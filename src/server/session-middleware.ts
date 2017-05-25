import { wrap } from 'async-middleware'
import * as express from 'express'
import * as HttpStatus from 'http-status-codes'
import { MarshalFrom } from 'raynor'

import { isLocal, Env } from '@neoncity/common-js'
import { AuthInfo, IdentityClient } from '@neoncity/identity-sdk-js'

import { CauseFeRequest } from './causefe-request'


const AUTH_INFO_COOKIE_NAME = 'neoncity-auth-info';


export function newSessionMiddleware(env: Env, identityClient: IdentityClient): express.RequestHandler {

    const authInfoMarshaller = new (MarshalFrom(AuthInfo))();

    return wrap(async (req: CauseFeRequest, res: express.Response, next: express.NextFunction) => {
	try {
	    if (req.cookies[AUTH_INFO_COOKIE_NAME] === undefined) {
		req.session = await identityClient.createSession();
		req.authInfo = new AuthInfo(req.session.id);
	    } else {
		const authInfo = authInfoMarshaller.extract(req.cookies[AUTH_INFO_COOKIE_NAME]);
		req.session = await identityClient.getOrCreateSession(authInfo.sessionId);
		req.authInfo = new AuthInfo(req.session.id, req.session.id == authInfo.sessionId ? authInfo.auth0AccessToken : null);
	    }
	} catch (e) {
	    // Could not extract the session if from a cookie
	    if (e.name == 'ExtractError') {
		console.log('Invalid session id');
		res.status(HttpStatus.BAD_REQUEST);
		res.end();
		return;

	    }

	    // Could not create or retrieve the session info.
	    if (e.name == 'IdentityError') {
		console.log('Could not speak with identity service');
		res.status(HttpStatus.INTERNAL_SERVER_ERROR);
		res.end();
		return;
	    }

	    console.log(`DB insertion error - ${e.toString()}`);
	    if (isLocal(env)) {
                console.log(e);
	    }
            
	    res.status(HttpStatus.INTERNAL_SERVER_ERROR);
	    res.end();
	    return;
	}

	// Set a cookie on the response.
        res.cookie(AUTH_INFO_COOKIE_NAME, authInfoMarshaller.pack(req.authInfo), {
	    expires: req.session.timeExpires,
	    httpOnly: true,
	    secure: !isLocal(env)
	});

	// Fire away.
	next();
    });
}
