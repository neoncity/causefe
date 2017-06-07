import * as express from 'express'
import * as fs from 'fs'
import * as path from 'path'


export interface Bundles {
    getJsIndexTemplate(): string;
    getHtmlIndexTemplate(): string;
    getOtherBundlesMiddleware(): express.RequestHandler;
}


export class WebpackDevBundles implements Bundles {
    private readonly _webpackDevMiddleware: any;

    constructor(webpackDevMiddleware: any) {
	this._webpackDevMiddleware = webpackDevMiddleware;
    }

    getJsIndexTemplate(): string {
	return this._webpackDevMiddleware.fileSystem.readFileSync(path.join(process.cwd(), 'out', 'client', 'client.js'), 'utf-8');
    }

    getHtmlIndexTemplate(): string {
	return this._webpackDevMiddleware.fileSystem.readFileSync(path.join(process.cwd(), 'out', 'client', 'index.html'), 'utf-8');
    }

    getOtherBundlesMiddleware(): express.RequestHandler {
	return this._webpackDevMiddleware;
    }
}


export class CompiledBundles implements Bundles {
    private readonly _jsIndexTemplate: string;
    private readonly _htmlIndexTemplate: string;

    constructor() {
        this._jsIndexTemplate = fs.readFileSync(path.join(process.cwd(), 'out', 'client', 'client.js'), 'utf-8');
        this._htmlIndexTemplate = fs.readFileSync(path.join(process.cwd(), 'out', 'client', 'index.html'), 'utf-8');
    }
    
    getJsIndexTemplate(): string {
	return this._jsIndexTemplate;
    }

    getHtmlIndexTemplate(): string {
	return this._htmlIndexTemplate;
    }

    getOtherBundlesMiddleware(): express.RequestHandler {
	return express.static(path.join(process.cwd(), 'out', 'client'));
    }
}
