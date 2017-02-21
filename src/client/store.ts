import { createStore, combineReducers } from 'redux'

import { User } from '@neoncity/identity-sdk-js'


export enum OpState {
    Init = 0,
    Loading = 1,
    Ready = 2,
    Failed = 3
}


interface IdentityInit {
    type: OpState.Init;
}
interface IdentityLoading {
    type: OpState.Loading;
}
interface IdentityReady {
    type: OpState.Ready;
    user: User;
}
interface IdentityFailed {
    type: OpState.Failed;
    errorMessage: string;
}

export type IdentityState = IdentityInit | IdentityLoading | IdentityReady | IdentityFailed;


const identityInitialState: IdentityState = {
    type: OpState.Init
};


function identity(state=identityInitialState, action: IdentityState): IdentityState {
    switch (action.type) {
    case OpState.Init:
    case OpState.Loading:
    case OpState.Ready:
    case OpState.Failed:
	return action;
    default:
	return state;
    }
}


const reducers = combineReducers({
    identity: identity
});


export const store = createStore(reducers);
