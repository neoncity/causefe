import { createStore, combineReducers } from 'redux';


export enum OpState {
    Init = 0,
    Loading = 1,
    Ready = 2,
    Failed = 3
}


interface IdentityInit {
    type: 'IDENTITY_INIT';
}
interface IdentityLoading {
    type: 'IDENTITY_LOADING';
}
interface IdentityReady {
    type: 'IDENTITY_READY';
    accessToken: string;
    user: any;
}
interface IdentityFailed {
    type: 'IDENTITY_FAILED';
    errorMessage: string;
}

type IdentityState = IdentityInit | IdentityLoading | IdentityReady | IdentityFailed;


const identityInitialState: IdentityState = {
    type: 'IDENTITY_INIT'
};


function identity(state=identityInitialState, action: IdentityState): IdentityState {
    switch (action.type) {
    case 'IDENTITY_INIT':
    case 'IDENTITY_LOADING':
    case 'IDENTITY_READY':
    case 'IDENTITY_FAILED':
	return action;
    default:
	return state;
    }
}


const reducers = combineReducers({
    identity: identity
});


export const store = createStore(reducers);
