import * as express from 'express'
import * as fs from 'fs'
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

        app.use(middleware);
        app.get('/', (_: express.Request, res: express.Response) => {
            res.write((middleware as any).fileSystem.readFileSync(path.join(process.cwd(), 'out', 'client', 'index.html')));
            res.end();
        });
    } else {
        const indexFile = fs.readFileSync(path.join(process.cwd(), 'out', 'client', 'index.html'));
        
        app.use('/out/client', express.static(path.join(process.cwd(), 'out', 'client')));
        app.get('/', (_: express.Request, res: express.Response) => {
            res.write(indexFile);
            res.end();
        });
    }

    app.listen(config.PORT, config.ADDRESS, () => {
	console.log(`Started ... ${config.ADDRESS}:${config.PORT}`);
    });
}

main();
