import { wrap } from 'async-middleware'
import * as express from 'express'
import * as HttpStatus from 'http-status-codes'
import Mustache = require('mustache')
import { MarshalFrom } from 'raynor'
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
import { CauseFeRequest } from './causefe-request'
import * as config from './config'
import { CompiledFiles, Files, WebpackDevFiles } from './files'


async function main() {
    const webpackConfig = require('../../webpack.config.js');
    const identityClient: IdentityClient = newIdentityClient(config.ENV, config.IDENTITY_SERVICE_HOST);
    const authInfoMarshaller = new (MarshalFrom(AuthInfo))();
    const sessionMarshaller = new (MarshalFrom(Session))();
    const app = express();

    const files: Files = isLocal(config.ENV)
	  ? new WebpackDevFiles(theWebpackDevMiddleware(webpack(webpackConfig), {
	      publicPath: webpackConfig.output.publicPath,
	      serverSideRender: false
          }))
	  : new CompiledFiles();

    app.use('/real/auth-flow', newAuthFlowRouter(identityClient));

    app.get('/real/client/client.js', [newAuthInfoMiddleware(AuthInfoLevel.SessionId), newSessionMiddleware(SessionLevel.Session, config.ENV, identityClient)], (req: CauseFeRequest, res: express.Response) => {
	const jsIndex = Mustache.render(files.getJsIndexTemplate(), _buildTemplateData(req.session as Session));
	res.write(jsIndex);
	res.status(HttpStatus.OK);
	res.end();
    });
    app.use(files.getOtherFilesMiddleware());
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
	    
        const htmlIndex = Mustache.render(files.getHtmlIndexTemplate(), _buildTemplateData(req.session as Session));

        res.write(htmlIndex);
	res.status(HttpStatus.OK);
        res.end();
    }));

    app.listen(config.PORT, config.ADDRESS, () => {
	console.log(`Started ... ${config.ADDRESS}:${config.PORT}`);
    });

    function _buildTemplateData(session: Session): any {
	return (Object as any).assign({}, config, {SESSION: JSON.stringify(sessionMarshaller.pack(session))});
    }
}


main();
