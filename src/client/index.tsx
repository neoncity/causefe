import { MarshalFrom } from 'raynor'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { Router, browserHistory } from 'react-router'
import * as Rollbar from 'rollbar'

import { WebFetcher, isOnServer, envToString } from '@neoncity/common-js'
import { IdentityClient, newIdentityClient } from '@neoncity/identity-sdk-js'
import {
    newCorePrivateClient,
    newCorePublicClient,
    CorePrivateClient,
    CorePublicClient
} from '@neoncity/core-sdk-js'

import { ApiGatewayWebFetcher } from './api-gateway-web-fetcher'
import { Auth0Service } from './auth0'
import * as config from './config1'
import './index.less'
import { routesConfig } from '../shared/routes-config'
import { OpState, reducers, StatePart } from '../shared/store'
import { Auth0Client } from '../shared/auth0'
import { FileStorageClient } from '../shared/file-storage'
import { ClientInitialState } from '../shared/client-data'
import { FileStorageService } from './file-storage-service'


const clientInitialStateMarshaller = new (MarshalFrom(ClientInitialState))();

const apiGatewayWebFetcher: WebFetcher = new ApiGatewayWebFetcher(config.ORIGIN);
const identityClient: IdentityClient = newIdentityClient(config.ENV, config.ORIGIN, config.IDENTITY_SERVICE_HOST, apiGatewayWebFetcher);
const corePublicClient: CorePublicClient = newCorePublicClient(config.ENV, config.ORIGIN, config.CORE_SERVICE_HOST, apiGatewayWebFetcher);
const corePrivateClient: CorePrivateClient = newCorePrivateClient(config.ENV, config.ORIGIN, config.CORE_SERVICE_HOST, apiGatewayWebFetcher);
const fileStorageClient: FileStorageClient = new FileStorageService(config.FILESTACK_KEY);
const auth0Client: Auth0Client = new Auth0Service(browserHistory, config.AUTH0_CLIENT_ID, config.AUTH0_DOMAIN, config.AUTH0_CALLBACK_URI);
const rollbar = new Rollbar({
    accessToken: isOnServer(config.ENV) ? (config.ROLLBAR_CLIENT_TOKEN as string) : 'FAKE_TOKEN_WONT_BE_USED_IN_LOCAL_OR_TEST',
    logLevel: 'warning',
    reportLevel: 'warning',
    captureUncaught: true,
    captureUnhandledRejections: true,
    enabled: isOnServer(config.ENV),
    payload: {
        // TODO: fill in the person field!
        serviceName: name,
        environment: envToString(config.ENV)
    }
});

config.setServices(identityClient, corePublicClient, corePrivateClient, fileStorageClient, auth0Client, rollbar);

const clientInitialState = clientInitialStateMarshaller.extract((window as any).__NEONCITY_CLIENT_INITIAL_STATE);
delete (window as any).__NEONCITY_INITIAL_STATE;

const initialState = {} as any;

if (clientInitialState.publicCauses != null) {
    initialState.publicCauses = {
        part: StatePart.PublicCauses,
        type: OpState.Preloaded,
        causes: clientInitialState.publicCauses
    };
}

if (clientInitialState.publicCauseDetail != null) {
    initialState.publicCauseDetail = {
        part: StatePart.PublicCauseDetail,
        type: OpState.Preloaded,
        cause: clientInitialState.publicCauseDetail
    };
}

const store = createStore(reducers, initialState, undefined);

ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory}>
            {routesConfig}
        </Router>
    </Provider>,
    document.getElementById('app')
);
