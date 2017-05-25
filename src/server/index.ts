import { wrap } from 'async-middleware'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as fs from 'fs'
import 'isomorphic-fetch'
import * as HttpStatus from 'http-status-codes'
import Mustache = require('mustache')
import * as path from 'path'
import { MarshalFrom, MarshalWith, OptionalOf } from 'raynor'
import * as url from 'url'
import * as webpack from 'webpack'
import * as theWebpackDevMiddleware from 'webpack-dev-middleware'

import { isLocal } from '@neoncity/common-js'
import {
    Auth0AccessTokenMarshaller,
    Auth0AuthorizationCodeMarshaller,
    AuthInfo,
    IdentityClient,
    newIdentityClient } from '@neoncity/identity-sdk-js'

import { CauseFeRequest } from './causefe-request'
import * as config from './config'
import { newSessionMiddleware } from './session-middleware'
import { PostLoginRedirectInfo, PostLoginRedirectInfoMarshaller } from '../shared/auth-flow'


export class Auth0AuthorizeRedirectInfo {
    @MarshalWith(OptionalOf(Auth0AuthorizationCodeMarshaller), 'code')
    authorizationCode: string|null;

    @MarshalWith(PostLoginRedirectInfoMarshaller)
    state: PostLoginRedirectInfo;
}


export class Auth0TokenExchangeResult {
    @MarshalWith(Auth0AccessTokenMarshaller, 'access_token')
    accessToken: string;
}


async function main() {
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

    const webpackConfig = require('../../webpack.config.js');
    const identityClient: IdentityClient = newIdentityClient(config.ENV, config.IDENTITY_SERVICE_HOST);
    const authInfoMarshaller = new (MarshalFrom(AuthInfo))();
    const auth0TokenExchangeResultMarshaller = new (MarshalFrom(Auth0TokenExchangeResult))();
    const auth0AuthorizeRedirectInfoMarshaller = new (MarshalFrom(Auth0AuthorizeRedirectInfo))();
    const app = express();

    if (isLocal(config.ENV)) {
        const webpackDevMiddleware = theWebpackDevMiddleware(webpack(webpackConfig), {
	    publicPath: webpackConfig.output.publicPath,
	    serverSideRender: false
        });

        app.get('/real/login', [cookieParser(), newSessionMiddleware(config.ENV, identityClient)], wrap(async (req: CauseFeRequest, res: express.Response) => {
	    let redirectInfo: Auth0AuthorizeRedirectInfo|null = null;
	    try {
	    	redirectInfo = auth0AuthorizeRedirectInfoMarshaller.extract(url.parse(req.url, true).query);
	    } catch (e) {
	    	console.log(`Auth error - ${e.toString()}`);
	    	if (isLocal(config.ENV)) {
                    console.log(e);
	    	}
		
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
		rawResponse = await fetch(`https://${config.AUTH0_DOMAIN}/oauth/token`, options);
	    } catch (e) {
		console.log(`Auth service error - ${e.toString()}`);
	    	if (isLocal(config.ENV)) {
                    console.log(e);
	    	}
		
	    	res.status(HttpStatus.INTERNAL_SERVER_ERROR);
	    	res.end();
	    	return;
	    }

	    let auth0TokenExchangeResult: Auth0TokenExchangeResult|null = null;
	    if (rawResponse.ok) {
		try {
		    const jsonResponse = await rawResponse.json();
		    auth0TokenExchangeResult = auth0TokenExchangeResultMarshaller.extract(jsonResponse);
		} catch (e) {
		    console.log(`Deserialization error - ${e.toString()}`);
	    	    if (isLocal(config.ENV)) {
			console.log(e);
	    	    }
		
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

	    const authInfo = new AuthInfo(req.session.id, auth0TokenExchangeResult.accessToken);

            res.cookie('neoncity-auth-info', authInfoMarshaller.pack(authInfo), {
		expires: req.session.timeExpires,
		httpOnly: true,
		secure: !isLocal(config.ENV)
	    });

	    res.redirect(redirectInfo.state.path);
        }));
	app.get('/real/client/client.js', [cookieParser(), newSessionMiddleware(config.ENV, identityClient)], (req: CauseFeRequest, res: express.Response) => {
	    const jsIndexTemplate = (webpackDevMiddleware as any).fileSystem.readFileSync(path.join(process.cwd(), 'out', 'client', 'client.js'), 'utf-8');
	    const jsIndex = Mustache.render(jsIndexTemplate, _buildTemplateData(req.authInfo));
	    res.write(jsIndex);
	    res.status(HttpStatus.OK);
	    res.end();
	});
        app.use(webpackDevMiddleware);
        app.get('*', [cookieParser(), newSessionMiddleware(config.ENV, identityClient)], wrap(async (req: CauseFeRequest, res: express.Response) => {
	    const htmlIndexTemplate = (webpackDevMiddleware as any).fileSystem.readFileSync(path.join(process.cwd(), 'out', 'client', 'index.html'), 'utf-8');
            const htmlIndex = Mustache.render(htmlIndexTemplate, _buildTemplateData(req.authInfo));

            res.write(htmlIndex);
	    res.status(HttpStatus.OK);
            res.end();
        }));
    } else {
        const jsIndexTemplate = fs.readFileSync(path.join(process.cwd(), 'out', 'client', 'client.js'), 'utf-8');
        const htmlIndexTemplate = fs.readFileSync(path.join(process.cwd(), 'out', 'client', 'index.html'), 'utf-8');

	app.get('/real/client/client.js', (_: express.Request, res: express.Response) => {
	    const jsIndex = Mustache.render(jsIndexTemplate, _buildTemplateData());
            res.write(jsIndex);
	    res.status(HttpStatus.OK);
            res.end();
        });
        app.use('/real/client', express.static(path.join(process.cwd(), 'out', 'client')));
        app.get('*', [cookieParser(), newSessionMiddleware(config.ENV, identityClient)], wrap(async (_: CauseFeRequest, res: express.Response) => {
            const htmlIndex = Mustache.render(htmlIndexTemplate, _buildTemplateData());
            res.write(htmlIndex);
	    res.status(HttpStatus.OK);
            res.end();
        }));
    }

    app.listen(config.PORT, config.ADDRESS, () => {
	console.log(`Started ... ${config.ADDRESS}:${config.PORT}`);
    });
}


function _buildTemplateData(authInfo: AuthInfo|null = null): any {
    // First, put in the things which are global for the application - the config.
    const templateData = (Object as any).assign({}, config);

    if (authInfo != null) {
	templateData['SESSION_ID'] = authInfo.sessionId;
	templateData['AUTH0_ACCESS_TOKEN'] = authInfo.auth0AccessToken;
    }
    
    // Then put template related data.
    templateData['LANG'] = 'en';
    return templateData;
}


main();
