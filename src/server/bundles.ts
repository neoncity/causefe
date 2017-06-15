import * as express from 'express'
import * as fs from 'fs'
import * as path from 'path'


export interface Bundles {
    getHtmlIndexTemplate(): string;
    getRobotsTxt(): string;
    getOtherBundlesRouter(): express.RequestHandler;
}


export class WebpackDevBundles implements Bundles {
    private readonly _webpackDevMiddleware: any;

    constructor(webpackDevMiddleware: any) {
	this._webpackDevMiddleware = webpackDevMiddleware;
    }

    getHtmlIndexTemplate(): string {
	return this._webpackDevMiddleware.fileSystem.readFileSync(path.join(process.cwd(), 'out', 'client', 'index.html'), 'utf-8');
    }

    getRobotsTxt(): string {
	return this._webpackDevMiddleware.fileSystem.readFileSync(path.join(process.cwd(), 'out', 'client', 'robots.txt'), 'utf-8');
    }    

    getOtherBundlesRouter(): express.RequestHandler {
	return this._webpackDevMiddleware;
    }
}


export class CompiledBundles implements Bundles {
    private readonly _htmlIndexTemplate: string;
    private readonly _robotsTxt: string;

    constructor() {
        this._htmlIndexTemplate = fs.readFileSync(path.join(process.cwd(), 'out', 'client', 'index.html'), 'utf-8');
        this._robotsTxt = fs.readFileSync(path.join(process.cwd(), 'out', 'client', 'robots.txt'), 'utf-8');
    }
    
    getHtmlIndexTemplate(): string {
	return this._htmlIndexTemplate;
    }

    getRobotsTxt(): string {
        return this._robotsTxt;
    }

    getOtherBundlesRouter(): express.RequestHandler {
	return express.static(path.join(process.cwd(), 'out', 'client'));
    }
}
