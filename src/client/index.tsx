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

import './index.less'
import * as config from './config'
import { routesConfig } from '../shared/routes-config'
import { OpState, reducers, StatePart } from '../shared/store'
import { FileStorageClient } from '../shared/file-storage'
import { InitialState } from '../shared/initial-state'
import { FileStorageService } from './file-storage-service'


const initialStateMarshaller = new (MarshalFrom(InitialState))();


const corePublicClient: CorePublicClient = newCorePublicClient(config.ENV, config.CORE_SERVICE_EXTERNAL_HOST);
const corePrivateClient: CorePrivateClient = newCorePrivateClient(config.ENV, config.CORE_SERVICE_EXTERNAL_HOST);
const fileStorageClient: FileStorageClient = new FileStorageService(config.FILESTACK_KEY);

const initialState = initialStateMarshaller.extract((window as any).__NEONCITY_INITIAL_STATE);
delete (window as any).__NEONCITY_INITIAL_STATE;
const initialReduxState = {
    request: {
	session: initialState.session,
	services: {
	    corePublicClient: corePublicClient,
	    corePrivateClient: corePrivateClient,
	    fileStorageClient: fileStorageClient
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
