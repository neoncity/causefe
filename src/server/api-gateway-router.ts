import { wrap } from 'async-middleware'
import * as bodyParser from 'body-parser'
import * as express from 'express'
import { MarshalFrom } from 'raynor'

import { AuthInfo } from '@neoncity/identity-sdk-js'
import { WebFetcher } from '@neoncity/common-js'
import {
    AuthInfoLevel,
    newAuthInfoMiddleware,
    newJsonContentMiddleware } from '@neoncity/common-server-js'

import { CauseFeRequest } from './causefe-request'


export function newApiGatewayRouter(webFetcher: WebFetcher): express.Router {
    const authInfoMarshaller = new (MarshalFrom(AuthInfo))();
    
    const apiGatewayRouter = express.Router();

    apiGatewayRouter.use(bodyParser.json());
    apiGatewayRouter.use(newJsonContentMiddleware());
    apiGatewayRouter.use(newAuthInfoMiddleware(AuthInfoLevel.SessionId));

    apiGatewayRouter.post('/', wrap(async (req: CauseFeRequest, res: express.Response) => {
	const newOptions = (Object as any).assign({}, req.body['options']);
	if (!newOptions.hasOwnProperty('headers')) {
	    newOptions.headers = {};
	}
	newOptions.headers[AuthInfo.HeaderName] = JSON.stringify(authInfoMarshaller.pack(req.authInfo as AuthInfo));
	const result = await webFetcher.fetch(req.body['uri'], req.body['options']);
        res.status(result.status);
	res.set('Content-Type', 'application/json; charset=utf-8');
	res.send(await result.text());
        res.end();
    }));

    return apiGatewayRouter;
}
