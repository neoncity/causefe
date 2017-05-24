import { wrap } from 'async-middleware'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as fs from 'fs'
import * as HttpStatus from 'http-status-codes'
import Mustache = require('mustache')
import * as path from 'path'
import * as webpack from 'webpack'
import * as theWebpackDevMiddleware from 'webpack-dev-middleware'

import { isLocal } from '@neoncity/common-js'
import { IdentityClient, newIdentityClient } from '@neoncity/identity-sdk-js'

import { CauseFeRequest } from './causefe-request'
import * as config from './config'
import { newSessionMiddleware } from './session-middleware'


async function main() {

    const webpackConfig = require('../../webpack.config.js');
    const identityClient: IdentityClient = newIdentityClient(config.ENV, config.IDENTITY_SERVICE_HOST);
    const app = express();

    if (isLocal(config.ENV)) {
        const webpackDevMiddleware = theWebpackDevMiddleware(webpack(webpackConfig), {
	    publicPath: webpackConfig.output.publicPath,
	    serverSideRender: false
        });

	app.get('/real/client/client.js', (_: express.Request, res: express.Response) => {
	    const jsIndexTemplate = (webpackDevMiddleware as any).fileSystem.readFileSync(path.join(process.cwd(), 'out', 'client', 'client.js'), 'utf-8');
	    const jsIndex = Mustache.render(jsIndexTemplate, _buildTemplateData());
	    res.write(jsIndex);
	    res.status(HttpStatus.OK);
	    res.end();
	});
        app.use(webpackDevMiddleware);
        app.get('/real/login', (req: express.Request, res: express.Response) => {
            console.log(req.url);
	    const htmlIndexTemplate = (webpackDevMiddleware as any).fileSystem.readFileSync(path.join(process.cwd(), 'out', 'client', 'index.html'), 'utf-8');
            const htmlIndex = Mustache.render(htmlIndexTemplate, _buildTemplateData());

            res.write(htmlIndex);
	    res.status(HttpStatus.OK);
            res.end();            
        });
        app.get('*', [cookieParser(), newSessionMiddleware(config.ENV, identityClient)], wrap(async (_: CauseFeRequest, res: express.Response) => {
	    const htmlIndexTemplate = (webpackDevMiddleware as any).fileSystem.readFileSync(path.join(process.cwd(), 'out', 'client', 'index.html'), 'utf-8');
            const htmlIndex = Mustache.render(htmlIndexTemplate, _buildTemplateData());

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


function _buildTemplateData(): any {
    // First, put in the things which are global for the application - the config.
    const templateData = (Object as any).assign({}, config);
    // Then put template related data.
    templateData['LANG'] = 'en';
    return templateData;
}


main();
