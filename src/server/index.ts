import * as express from 'express'
import * as fs from 'fs'
import Mustache = require('mustache')
import * as path from 'path'
import * as webpack from 'webpack'
import * as webpackDevMiddleware from 'webpack-dev-middleware'

import { isLocal } from '@neoncity/common-js/env'

import * as config from './config'


async function main() {

    const webpackConfig = require('../../webpack.config.js');
    const app = express();

    if (isLocal(config.ENV)) {
        const middleware = webpackDevMiddleware(webpack(webpackConfig), {
	    publicPath: webpackConfig.output.publicPath,
	    serverSideRender: false
        });

	app.get('/real/client/client.js', (_: express.Request, res: express.Response) => {
	    const jsIndexTemplate = (middleware as any).fileSystem.readFileSync(path.join(process.cwd(), 'out', 'client', 'client.js'), 'utf-8');
	    const jsIndex = Mustache.render(jsIndexTemplate, _buildTemplateData());
	    res.write(jsIndex);
	    res.end();
	});
        app.use(middleware);
        app.get('*', (_: express.Request, res: express.Response) => {
            const htmlIndexTemplate = (middleware as any).fileSystem.readFileSync(path.join(process.cwd(), 'out', 'client', 'index.html'), 'utf-8');
            const htmlIndex = Mustache.render(htmlIndexTemplate, _buildTemplateData());
            res.write(htmlIndex);
            res.end();
        });
    } else {
        const jsIndexTemplate = fs.readFileSync(path.join(process.cwd(), 'out', 'client', 'client.js'), 'utf-8');
        const htmlIndexTemplate = fs.readFileSync(path.join(process.cwd(), 'out', 'client', 'index.html'), 'utf-8');

	app.get('/real/client/client.js', (_: express.Request, res: express.Response) => {
            console.log('Here');
	    const jsIndex = Mustache.render(jsIndexTemplate, _buildTemplateData());
            res.write(jsIndex);
            res.end();
        });
        app.use('/real/client', express.static(path.join(process.cwd(), 'out', 'client')));
        app.get('*', (_: express.Request, res: express.Response) => {
            const htmlIndex = Mustache.render(htmlIndexTemplate, _buildTemplateData());
            res.write(htmlIndex);
            res.end();
        });
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
