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

import './index.less'
import { routesConfig } from '../shared/routes-config'
import { reducers } from '../shared/store'
import { FileStorageService } from './file-storage-service'

const initialState = (window as any).__NEONCITY_INITIAL_STATE;
delete (window as any).__NEONCITY_INITIAL_STATE;

const config = (window as any).__NEONCITY_CONFIG;
delete (window as any).__NEONCITY_CONFIG;

const corePublicClient: CorePublicClient = newCorePublicClient(config.ENV, config.CORE_SERVICE_EXTERNAL_HOST);
const corePrivateClient: CorePrivateClient = newCorePrivateClient(config.ENV, config.CORE_SERVICE_EXTERNAL_HOST);
const fileStorageService = new FileStorageService(config.FILESTACK_KEY);

const store = createStore(reducers, initialState, undefined);





ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory}>
            {routesConfig}
        </Router>
    </Provider>,
    document.getElementById('app')
);
