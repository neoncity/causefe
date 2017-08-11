import * as express from 'express'
import * as fs from 'fs'
import * as path from 'path'


export interface Bundles {
    getHtmlIndexTemplate(): string;
    getRobotsTxt(): string;
    getHumansTxt(): string;
    getSitemapXml(): string;
    getManifestJs(): string;
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

    getHumansTxt(): string {
        return this._webpackDevMiddleware.fileSystem.readFileSync(path.join(process.cwd(), 'out', 'client', 'humans.txt'), 'utf-8');
    }

    getSitemapXml(): string {
        return this._webpackDevMiddleware.fileSystem.readFileSync(path.join(process.cwd(), 'out', 'client', 'sitemap.xml'), 'utf-8');
    }

    getManifestJs(): string {
        return this._webpackDevMiddleware.fileSystem.readFileSync(path.join(process.cwd(), 'out', 'client', 'manifest.js'), 'utf-8');
    }

    getOtherBundlesRouter(): express.RequestHandler {
        return this._webpackDevMiddleware;
    }
}


export class CompiledBundles implements Bundles {
    private readonly _htmlIndexTemplate: string;
    private readonly _robotsTxt: string;
    private readonly _humansTxt: string;
    private readonly _sitemapXml: string;
    private readonly _manifestJs: string;

    constructor() {
        this._htmlIndexTemplate = fs.readFileSync(path.join(process.cwd(), 'out', 'client', 'index.html'), 'utf-8');
        this._robotsTxt = fs.readFileSync(path.join(process.cwd(), 'out', 'client', 'robots.txt'), 'utf-8');
        this._humansTxt = fs.readFileSync(path.join(process.cwd(), 'out', 'client', 'humans.txt'), 'utf-8');
        this._sitemapXml = fs.readFileSync(path.join(process.cwd(), 'out', 'client', 'sitemap.xml'), 'utf-8');
        this._manifestJs = fs.readFileSync(path.join(process.cwd(), 'out', 'client', 'manifest.js'), 'utf-8');
    }

    getHtmlIndexTemplate(): string {
        return this._htmlIndexTemplate;
    }

    getRobotsTxt(): string {
        return this._robotsTxt;
    }

    getHumansTxt(): string {
        return this._humansTxt;
    }

    getSitemapXml(): string {
        return this._sitemapXml;
    }

    getManifestJs(): string {
        return this._manifestJs;
    }

    getOtherBundlesRouter(): express.RequestHandler {
        return express.static(path.join(process.cwd(), 'out', 'client'));
    }
}
