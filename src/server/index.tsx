import { wrap } from 'async-middleware'
import { createNamespace } from 'continuation-local-storage'
import * as express from 'express'
import * as HttpStatus from 'http-status-codes'
import Mustache = require('mustache')
import { MarshalFrom } from 'raynor'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import { Helmet } from 'react-helmet'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { RouterContext, RouterState } from 'react-router'
import * as serializeJavascript from 'serialize-javascript'
import * as webpack from 'webpack'
import * as theWebpackDevMiddleware from 'webpack-dev-middleware'

import { isLocal } from '@neoncity/common-js'
import {
    AuthInfoLevel,
    newAuthInfoMiddleware,
    newSessionMiddleware,
    SessionLevel } from '@neoncity/common-server-js'
import {
    CauseSummary,
    CorePublicClient,
    newCorePublicClient,
    PublicCause } from '@neoncity/core-sdk-js'
import {
    AuthInfo,
    IdentityClient,
    newIdentityClient,
    Session } from '@neoncity/identity-sdk-js'

import { newAuthFlowRouter } from './auth-flow-router'
import { CompiledBundles, Bundles, WebpackDevBundles } from './bundles'
import { CauseFeRequest } from './causefe-request'
import { newEnsureSessionMiddleware } from './ensure-session-middleware'
import { newNamespaceMiddleware } from './namespace-middleware'
import * as config from '../shared/config'
import { routesConfig } from '../shared/routes-config'
import { OpState, reducers, StatePart } from '../shared/store'
import { ClientConfig, ClientInitialState } from '../shared/client-data'
import { causeLink,inferLanguage } from '../shared/utils'
import { newServerSideRenderingMatchMiddleware } from './ssr-match-middleware'



async function main() {
    const webpackConfig = require('../../webpack.config.js');
    const identityClient: IdentityClient = newIdentityClient(config.ENV, config.IDENTITY_SERVICE_HOST);
    const corePublicClient: CorePublicClient = newCorePublicClient(config.ENV, config.CORE_SERVICE_HOST);
    const clientConfigMarshaller = new (MarshalFrom(ClientConfig))();
    const clientInitialStateMarshaller = new (MarshalFrom(ClientInitialState))();
    const app = express();

    const bundles: Bundles = isLocal(config.ENV)
          ? new WebpackDevBundles(theWebpackDevMiddleware(webpack(webpackConfig), {
              //Different because we're mounting on /real/client to boot webpackConfig.output.publicPath,              
              publicPath: '/',
              serverSideRender: false
          }))
          : new CompiledBundles();

    const namespace = createNamespace(config.CLS_NAMESPACE_NAME);

    app.use(newNamespaceMiddleware(namespace))
    app.use('/real/auth-flow', newAuthFlowRouter(identityClient));
    app.use('/real/client', bundles.getOtherBundlesRouter());

    function serverSideRender(session: Session, initialState: ClientInitialState, ssrRouterState: RouterState): string {
        const language = inferLanguage(session);
        const store = createStore(reducers);

        if (initialState.publicCauses != null) {
            store.dispatch({part: StatePart.PublicCauses, type: OpState.Preloaded, causes: initialState.publicCauses});
        }

        if (initialState.publicCauseDetail != null) {
            store.dispatch({part: StatePart.PublicCauseDetail, type: OpState.Preloaded, cause: initialState.publicCauseDetail});
        }    

        const clientConfig = {
            env: config.ENV,
            context: config.CONTEXT,
            auth0ClientId: config.AUTH0_CLIENT_ID,
            auth0Domain: config.AUTH0_DOMAIN,
            auth0CallbackUri: config.AUTH0_CALLBACK_URI,
            fileStackKey: config.FILESTACK_KEY,
            identityServiceExternalHost: config.IDENTITY_SERVICE_EXTERNAL_HOST,
            coreServiceExternalHost: config.CORE_SERVICE_EXTERNAL_HOST,
            facebookAppId: config.FACEBOOK_APP_ID,
            logoutRoute: config.LOGOUT_ROUTE,
            session: session,
            language: language
        };

        namespace.set('SESSION', session);
        namespace.set('LANG', language);
        
        const appHtml = ReactDOMServer.renderToString(
            <Provider store={store}>
                <RouterContext {...(ssrRouterState as any)} />
            </Provider>
        );

        const helmetData = Helmet.renderStatic();

        return Mustache.render(bundles.getHtmlIndexTemplate(), {
            PAGE_TITLE_HTML: helmetData.title,
            FACEBOOK_APP_ID: config.FACEBOOK_APP_ID,
            APP_HTML: appHtml,
            CLIENT_CONFIG: serializeJavascript(clientConfigMarshaller.pack(clientConfig), {isJSON: true}),
            CLIENT_INITIAL_STATE: serializeJavascript(clientInitialStateMarshaller.pack(initialState), {isJSON: true})
        });    
    }

    const siteInfoRouter = express.Router();

    siteInfoRouter.get('/robots.txt', (_req: CauseFeRequest, res: express.Response) => {
        res.type('.txt');
        res.write(Mustache.render(bundles.getRobotsTxt(), { HOME_URI: config.ORIGIN }));
        res.status(HttpStatus.OK);
        res.end();
    });

    siteInfoRouter.get('/humans.txt', (_req: CauseFeRequest, res: express.Response) => {
        res.type('.txt');
        res.write(bundles.getHumansTxt());
        res.status(HttpStatus.OK);
        res.end();
    });

    siteInfoRouter.get('/sitemap.xml', wrap(async (_req: CauseFeRequest, res: express.Response) => {
        let allCauseSummaries: CauseSummary[]|null = null;
        try {
            allCauseSummaries = await corePublicClient.withContext(null, config.ORIGIN).getAllCauseSummaries();
        } catch (e) {
            console.log(`Cannot retrieve causes server-side - ${e.toString()}`);
            if (isLocal(config.ENV)) {
                console.log(e);
            }

            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            res.end();
        }
        
        res.type('.xml; charset=utf-8');
        res.write(Mustache.render(bundles.getSitemapXml(), {
            HOME_URI: config.ORIGIN,
            HOME_LAST_MOD: new Date().toISOString(),
            CAUSES: (allCauseSummaries as CauseSummary[]).map(summary => ({
                PATH: causeLink(summary),
                LAST_MOD: summary.timeLastUpdated.toISOString()
            }))
        }));
        res.status(HttpStatus.OK);
        res.end();
    }));

    const appRouter = express.Router();

    appRouter.use(newAuthInfoMiddleware(AuthInfoLevel.None));
    appRouter.use(newSessionMiddleware(SessionLevel.None, config.ENV, config.ORIGIN, identityClient));
    appRouter.use(newEnsureSessionMiddleware(config.ENV, identityClient));
    appRouter.use(newServerSideRenderingMatchMiddleware(config.ENV, routesConfig));

    appRouter.get('/', wrap(async (req: CauseFeRequest, res: express.Response) => {
        let causes: PublicCause[]|null = null;
        try {
            causes = await corePublicClient.withContext(req.authInfo as AuthInfo, config.ORIGIN).getCauses();
        } catch (e) {
            console.log(`Cannot retrieve causes server-side - ${e.toString()}`);
            if (isLocal(config.ENV)) {
                console.log(e);
            }
        }

        const initialState = {
            publicCauses: causes,
            publicCauseDetail: null
        };

        res.write(serverSideRender(
            req.session as Session,
            initialState,
            req.ssrRouterState
        ));
        res.status(HttpStatus.OK);
        res.end();      
    }));

    appRouter.get('/c/:causeId(\\d+)/:causeSlug', wrap(async (req: CauseFeRequest, res: express.Response) => {
        let cause: PublicCause|null = null;
        try {
            const causeId = parseInt(req.params['causeId']);
            cause = await corePublicClient.withContext(req.authInfo as AuthInfo, config.ORIGIN).getCause(causeId);
        } catch (e) {
            console.log(`Cannot retrieve causes server-side - ${e.toString()}`);
            if (isLocal(config.ENV)) {
                console.log(e);
            }
        }

        const initialState = {
            publicCauses: null,
            publicCauseDetail: cause
        };

        res.write(serverSideRender(
            req.session as Session,
            initialState,
            req.ssrRouterState
        ));
        res.status(HttpStatus.OK);
        res.end();      
    }));

    appRouter.get('*', wrap(async (req: CauseFeRequest, res: express.Response) => {
        const initialState = {
            publicCauses: null,
            publicCauseDetail: null
        };

        res.write(serverSideRender(
            req.session as Session,
            initialState,
            req.ssrRouterState
        ));
        res.status(HttpStatus.OK);
        res.end();      
    }));

    app.use('/', siteInfoRouter);
    app.use('/', appRouter);

    app.listen(config.PORT, config.ADDRESS, () => {
        console.log(`Started ... ${config.ADDRESS}:${config.PORT}`);
    });
}


main();
