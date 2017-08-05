import { wrap } from 'async-middleware'
import * as bodyParser from 'body-parser'
import * as express from 'express'

import {
    AuthInfoLevel,
    newAuthInfoMiddleware,
    newJsonContentMiddleware } from '@neoncity/common-server-js'

import { CauseFeRequest } from './causefe-request'


export function newApiGatewayRouter(): express.Router {
    const apiGatewayRouter = express.Router();

    apiGatewayRouter.use(bodyParser.json());
    apiGatewayRouter.use(newJsonContentMiddleware());
    apiGatewayRouter.use(newAuthInfoMiddleware(AuthInfoLevel.SessionId));

    apiGatewayRouter.post('/', wrap(async (req: CauseFeRequest, res: express.Response) => {
        console.log(req.body);
        res.status(404);
        res.end();
    }));

    return apiGatewayRouter;
}
