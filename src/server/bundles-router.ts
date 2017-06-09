import * as express from 'express'
import * as HttpStatus from 'http-status-codes'
import Mustache = require('mustache')

import {
    AuthInfoLevel,
    newAuthInfoMiddleware,
    newSessionMiddleware,
    SessionLevel } from '@neoncity/common-server-js'
import { IdentityClient, Session, User } from '@neoncity/identity-sdk-js'

import { CauseFeRequest } from './causefe-request'
import * as config from './config'
import { Bundles } from './bundles'


export function newBundlesRouter(bundles: Bundles, identityClient: IdentityClient): express.Router {
    const bundlesRouter = express.Router();

    bundlesRouter.use(newAuthInfoMiddleware(AuthInfoLevel.SessionId));
    bundlesRouter.use(newSessionMiddleware(SessionLevel.Session, config.ENV, identityClient));

    bundlesRouter.get('/client.js', (req: CauseFeRequest, res: express.Response) => {
	const session = req.session as Session;
        const jsIndex = Mustache.render(bundles.getJsIndexTemplate(), {
	    ENV: config.ENV,
	    AUTH0_CLIENT_ID: config.AUTH0_CLIENT_ID,
	    AUTH0_DOMAIN: config.AUTH0_DOMAIN,
	    AUTH0_CALLBACK_URI: config.AUTH0_CALLBACK_URI,
	    FILESTACK_KEY: config.FILESTACK_KEY,
	    IDENTITY_SERVICE_EXTERNAL_HOST: config.IDENTITY_SERVICE_EXTERNAL_HOST,
	    CORE_SERVICE_EXTERNAL_HOST: config.CORE_SERVICE_EXTERNAL_HOST,
	    FACEBOOK_APP_ID: config.FACEBOOK_APP_ID,
	    LOGOUT_ROUTE: config.LOGOUT_ROUTE,
	    LANG: session.hasUser() ? (session.user as User).language : 'en'
	});
	
        res.write(jsIndex);
        res.status(HttpStatus.OK);
        res.end();
    });
    
    bundlesRouter.use('/', bundles.getOtherBundlesMiddleware());


    return bundlesRouter;
}
