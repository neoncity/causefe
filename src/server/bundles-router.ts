import * as express from 'express'

import {
    AuthInfoLevel,
    newAuthInfoMiddleware,
    newSessionMiddleware,
    SessionLevel } from '@neoncity/common-server-js'
import { IdentityClient } from '@neoncity/identity-sdk-js'

import * as config from './config'
import { Bundles } from './bundles'


export function newBundlesRouter(bundles: Bundles, identityClient: IdentityClient): express.Router {
    const bundlesRouter = express.Router();

    bundlesRouter.use(newAuthInfoMiddleware(AuthInfoLevel.SessionId));
    bundlesRouter.use(newSessionMiddleware(SessionLevel.Session, config.ENV, identityClient));
    bundlesRouter.get('/client.js', (req: CauseFeRequest, res: express.Response) => {
        const jsIndex = Mustache.render(bundles.getJsIndexTemplate(), config);
        res.write(jsIndex);
        res.status(HttpStatus.OK);
        res.end();
    });
    
    bundlesRouter.use('/', bundles.getOtherBundlesMiddleware());


    return bundlesRouter;
}
