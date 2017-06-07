import * as express from 'express'
import * as fs from 'fs'
import * as path from 'path'


export interface Files {
    getJsIndexTemplate(): string;
    getHtmlIndexTemplate(): string;
    getOtherFilesMiddleware(): express.RequestHandler;
}


export class WebpackDevFiles implements Files {
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

    getOtherFilesMiddleware(): express.RequestHandler {
	return this._webpackDevMiddleware;
    }
}


export class CompiledFiles implements Files {
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

    getOtherFilesMiddleware(): express.RequestHandler {
	return (_0: express.Request, _1: express.Response, next: express.NextFunction) => {
	    next();
	};
    }
}
