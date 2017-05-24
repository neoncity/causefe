import { wrap } from 'async-middleware'
import * as express from 'express'
import * as HttpStatus from 'http-status-codes'
import { UuidMarshaller } from 'raynor'

import { isLocal, Env } from '@neoncity/common-js'
import { IdentityClient } from '@neoncity/identity-sdk-js'

import { CauseFeRequest } from './causefe-request'


const SESSION_COOKIE_NAME = 'neoncity-session';


export function newSessionMiddleware(env: Env, identityClient: IdentityClient): express.RequestHandler {

    const uuidMarshaller = new UuidMarshaller();

    return wrap(async (req: CauseFeRequest, res: express.Response, next: express.NextFunction) => {
	try {
	    if (req.cookies['neoncity-session'] === undefined) {
		req.session = await identityClient.createSession();
	    } else {
		const sessionId = uuidMarshaller.extract(req.cookies['neoncity-session']);
		req.session = await identityClient.getOrCreateSession(sessionId);
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
        res.cookie(SESSION_COOKIE_NAME, uuidMarshaller.pack(req.session.id), {
	    expires: req.session.timeExpires,
	    httpOnly: true,
	    secure: !isLocal(env)
	});

	// Fire away.
	next();
    });
}
