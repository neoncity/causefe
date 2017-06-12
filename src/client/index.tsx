import { MarshalFrom } from 'raynor'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { Router, browserHistory } from 'react-router'

import {
    newCorePrivateClient,
    newCorePublicClient,
    CorePrivateClient,
    CorePublicClient } from '@neoncity/core-sdk-js'

import { Auth0Service } from './auth0'
import * as config from '../shared/config'
import './index.less'
import { routesConfig } from '../shared/routes-config'
import { OpState, reducers, StatePart } from '../shared/store'
import { Auth0Client } from '../shared/auth0'
import { FileStorageClient } from '../shared/file-storage'
import { InitialState } from '../shared/initial-state'
import { FileStorageService } from './file-storage-service'


const initialStateMarshaller = new (MarshalFrom(InitialState))();


const corePublicClient: CorePublicClient = newCorePublicClient(config.ENV, config.CORE_SERVICE_EXTERNAL_HOST);
const corePrivateClient: CorePrivateClient = newCorePrivateClient(config.ENV, config.CORE_SERVICE_EXTERNAL_HOST);
const fileStorageClient: FileStorageClient = new FileStorageService(config.FILESTACK_KEY);
const auth0Client: Auth0Client = new Auth0Service(browserHistory, config.AUTH0_CLIENT_ID, config.AUTH0_DOMAIN, config.AUTH0_CALLBACK_URI);

const initialState = initialStateMarshaller.extract((window as any).__NEONCITY_INITIAL_STATE);
delete (window as any).__NEONCITY_INITIAL_STATE;
const initialReduxState = {
    request: {
	services: {
	    corePublicClient: corePublicClient,
	    corePrivateClient: corePrivateClient,
	    fileStorageClient: fileStorageClient,
            auth0Client: auth0Client
	}
    },
    publicCauses: {
        part: StatePart.PublicCauses,
        type: OpState.Ready,
        causes: initialState.publicCauses
    }
};

const store = createStore(reducers, initialReduxState, undefined);

ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory}>
            {routesConfig}
        </Router>
    </Provider>,
    document.getElementById('app')
);
