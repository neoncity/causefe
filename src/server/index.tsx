import { wrap } from 'async-middleware'
import { createNamespace } from 'continuation-local-storage'
import * as express from 'express'
import * as HttpStatus from 'http-status-codes'
import Mustache = require('mustache')
import { MarshalFrom } from 'raynor'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
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
    newCorePublicClient,
    CorePublicClient,
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
import { inferLanguage } from '../shared/utils'
import { newServerSideRenderingMatchMiddleware } from './ssr-match-middleware'


async function main() {
    const webpackConfig = require('../../webpack.config.js');
    const identityClient: IdentityClient = newIdentityClient(config.ENV, config.IDENTITY_SERVICE_HOST);
    const corePublicClient: CorePublicClient = newCorePublicClient(config.ENV, config.CORE_SERVICE_HOST);
    const authInfoMarshaller = new (MarshalFrom(AuthInfo))();
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

    const appRouter = express.Router();

    appRouter.use(newAuthInfoMiddleware(AuthInfoLevel.None));
    appRouter.use(newSessionMiddleware(SessionLevel.None, config.ENV, identityClient));
    appRouter.use(newEnsureSessionMiddleware(config.ENV, identityClient));
    appRouter.use(newServerSideRenderingMatchMiddleware(config.ENV, routesConfig));

    appRouter.get('/', wrap(async (req: CauseFeRequest, res: express.Response) => {
        const session = req.session as Session;
        const language = inferLanguage(session);

        let causes: PublicCause[]|null = null;
        try {
            causes = await corePublicClient.withAuthInfo(req.authInfo as AuthInfo).getCauses();
        } catch (e) {
            console.log(`Cannot retrieve causes server-side - ${e.toString()}`);
            if (isLocal(config.ENV)) {
                console.log(e);
            }
        }

        const store = createStore(reducers);

        // Will work even if causes is not null. Client-side will re-query for it.
        if (causes != null) {
            store.dispatch({part: StatePart.PublicCauses, type: OpState.Preloaded, causes: causes});
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

        const initialState = {
            publicCauses: causes,
            publicCauseDetail: null
        };
            
        namespace.set('SESSION', session);
        namespace.set('LANG', language);
            
        const appHtml = ReactDOMServer.renderToString(
            <Provider store={store}>
                <RouterContext {...(req.ssrRouterState as any)} />
            </Provider>
        );

        const htmlIndex = Mustache.render(bundles.getHtmlIndexTemplate(), {
            FACEBOOK_APP_ID: config.FACEBOOK_APP_ID,
            APP_HTML: appHtml,
            CLIENT_CONFIG: JSON.stringify(clientConfigMarshaller.pack(clientConfig)),
            CLIENT_INITIAL_STATE: JSON.stringify(clientInitialStateMarshaller.pack(initialState))
        });

        res.write(htmlIndex);
        res.status(HttpStatus.OK);
        res.end();      
    }));

    appRouter.get('/c/:causeId(\\d+)/:causeSlug', wrap(async (req: CauseFeRequest, res: express.Response) => {
        const session = req.session as Session;
        const language = inferLanguage(session);

        let cause: PublicCause|null = null;
        try {
            const causeId = parseInt(req.params['causeId']);
            cause = await corePublicClient.withAuthInfo(req.authInfo as AuthInfo).getCause(causeId);
        } catch (e) {
            console.log(`Cannot retrieve causes server-side - ${e.toString()}`);
            if (isLocal(config.ENV)) {
                console.log(e);
            }
        }

        const store = createStore(reducers);

        // Will work even if causes is not null. Client-side will re-query for it.
        if (cause != null) {
            store.dispatch({part: StatePart.PublicCauseDetail, type: OpState.Preloaded, cause: cause});
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

        const initialState = {
            publicCauses: null,
            publicCauseDetail: cause
        };
            
        namespace.set('SESSION', session);
        namespace.set('LANG', language);
            
        const appHtml = ReactDOMServer.renderToString(
            <Provider store={store}>
                <RouterContext {...(req.ssrRouterState as any)} />
            </Provider>
        );

        const htmlIndex = Mustache.render(bundles.getHtmlIndexTemplate(), {
            FACEBOOK_APP_ID: config.FACEBOOK_APP_ID,
            APP_HTML: appHtml,
            CLIENT_CONFIG: JSON.stringify(clientConfigMarshaller.pack(clientConfig)),
            CLIENT_INITIAL_STATE: JSON.stringify(clientInitialStateMarshaller.pack(initialState))
        });

        res.write(htmlIndex);
        res.status(HttpStatus.OK);
        res.end();      
    }));    

    app.use('/', appRouter);

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

        match({ routes: routesConfig, location: req.url}, async (err, redirect, props) => {
            if (err) {
                console.log(`Some sort of error during matching - ${err.toString()}`);
                if (isLocal(config.ENV)) {
                    console.log(err);
                }

                res.status(HttpStatus.INTERNAL_SERVER_ERROR);
                res.end();
                return;
            }

            if (redirect) {
                res.redirect(redirect.pathname + redirect.search);
                return;
            }

            if (!props) {
                res.status(HttpStatus.NOT_FOUND);
                res.end();
                return;
            }

            console.log(props);

            const session = req.session as Session;
            const language = inferLanguage(session);

            let causes: PublicCause[]|null = null;
            let causeDetail: PublicCause|null = null;
            
            try {
                causes = await corePublicClient.withAuthInfo(req.authInfo as AuthInfo).getCauses();
            } catch (e) {
                console.log(`Cannot retrieve causes server-side - ${e.toString()}`);
                if (isLocal(config.ENV)) {
                    console.log(e);
                }
            }

            const store = createStore(reducers);

            // Will work even if causes is not null. Client-side will re-query for it.
            if (causes != null) {
                store.dispatch({part: StatePart.PublicCauses, type: OpState.Preloaded, causes: causes});
            }

            if (causeDetail != null) {
                store.dispatch({part: StatePart.PublicCauseDetail, type: OpState.Preloaded, cause: causeDetail});
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

            const initialState = {
                publicCauses: causes,
                publicCauseDetail: causeDetail
            };
            
            namespace.set('SESSION', session);
            namespace.set('LANG', language);
            
            const appHtml = ReactDOMServer.renderToString(
                <Provider store={store}>
                    <RouterContext {...props} />
                </Provider>
            );

            const htmlIndex = Mustache.render(bundles.getHtmlIndexTemplate(), {
                FACEBOOK_APP_ID: config.FACEBOOK_APP_ID,
                APP_HTML: appHtml,
                CLIENT_CONFIG: JSON.stringify(clientConfigMarshaller.pack(clientConfig)),
                CLIENT_INITIAL_STATE: JSON.stringify(clientInitialStateMarshaller.pack(initialState))
            });

            res.write(htmlIndex);
            res.status(HttpStatus.OK);
            res.end();      
        });
    }));

    app.listen(config.PORT, config.ADDRESS, () => {
        console.log(`Started ... ${config.ADDRESS}:${config.PORT}`);
    });
}


main();
