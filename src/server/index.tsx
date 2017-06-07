import { wrap } from 'async-middleware'
import * as express from 'express'
import * as HttpStatus from 'http-status-codes'
import Mustache = require('mustache')
import { MarshalFrom } from 'raynor'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import { Provider } from 'react-redux'
import { match, RouterContext } from 'react-router'
import * as webpack from 'webpack'
import * as theWebpackDevMiddleware from 'webpack-dev-middleware'

import { isLocal } from '@neoncity/common-js'
import {
    AuthInfoLevel,
    newAuthInfoMiddleware,
    newSessionMiddleware,
    SessionLevel } from '@neoncity/common-server-js'
import {
    AuthInfo,
    IdentityClient,
    newIdentityClient,
    Session } from '@neoncity/identity-sdk-js'

import { newAuthFlowRouter } from './auth-flow-router'
import { CompiledBundles, Bundles, WebpackDevBundles } from './bundles'
import { newBundlesRouter } from './bundles-router'
import { CauseFeRequest } from './causefe-request'
import * as config from './config'
import { buildTemplateData } from './template-data'
import { routesConfig } from '../shared/routes-config'
import { store } from '../shared/store'


async function main() {
    const webpackConfig = require('../../webpack.config.js');
    const identityClient: IdentityClient = newIdentityClient(config.ENV, config.IDENTITY_SERVICE_HOST);
    const authInfoMarshaller = new (MarshalFrom(AuthInfo))();
    const app = express();

    const bundles: Bundles = isLocal(config.ENV)
	  ? new WebpackDevBundles(theWebpackDevMiddleware(webpack(webpackConfig), {
	      publicPath: '/', //Different because we're mounting on /real/client to boot webpackConfig.output.publicPath,
	      serverSideRender: false
          }))
	  : new CompiledBundles();

    app.use('/real/auth-flow', newAuthFlowRouter(identityClient));
    app.use('/real/client', newBundlesRouter(bundles, identityClient));

    app.get('*', [newAuthInfoMiddleware(AuthInfoLevel.None), newSessionMiddleware(SessionLevel.None, config.ENV, identityClient)], wrap(async (req: CauseFeRequest, res: express.Response) => {
	if (req.authInfo == null || req.session == null) {
	    try {
		const [authInfo, session] = await identityClient.getOrCreateSession();
		req.authInfo = authInfo;
		req.session = session;

		res.cookie(AuthInfo.CookieName, authInfoMarshaller.pack(authInfo), {
		    expires: session.timeExpires,
		    httpOnly: true,
		    secure: !isLocal(config.ENV)
		});
	    } catch (e) {
		console.log(`Session creation error - ${e.toString()}`);
	    	if (isLocal(config.ENV)) {
		    console.log(e);
	    	}
		
	    	res.status(HttpStatus.INTERNAL_SERVER_ERROR);
	    	res.end();
	    	return;		    
	    }
	}

	match({ routes: routesConfig, location: req.url}, (_err, _redirect, props) => {
	    // TODO: handle err and redirect correctly.
	    const coreHtml = ReactDOMServer.renderToString(
		    <Provider store={store}>
		        <RouterContext {...props} />
		    </Provider>);

            const htmlIndex = Mustache.render(bundles.getHtmlIndexTemplate(), buildTemplateData(req.session as Session));

            res.write(htmlIndex + coreHtml);
	    res.status(HttpStatus.OK);
            res.end();	    
	});
    }));

    app.listen(config.PORT, config.ADDRESS, () => {
	console.log(`Started ... ${config.ADDRESS}:${config.PORT}`);
    });
}


main();
