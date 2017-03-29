import { createStore, combineReducers } from 'redux'

import { PublicCause } from '@neoncity/core-sdk-js'
import { User } from '@neoncity/identity-sdk-js'


export enum StatePart {
    Identity = 0,
    PublicCauses = 1
}


export enum OpState {
    Init = 0,
    Loading = 1,
    Ready = 2,
    Failed = 3
}


interface IdentityInit {
    part: StatePart.Identity;
    type: OpState.Init;
}
interface IdentityLoading {
    part: StatePart.Identity;    
    type: OpState.Loading;
}
interface IdentityReady {
    part: StatePart.Identity;    
    type: OpState.Ready;
    user: User;
}
interface IdentityFailed {
    part: StatePart.Identity;    
    type: OpState.Failed;
    errorMessage: string;
}

export type IdentityState = IdentityInit | IdentityLoading | IdentityReady | IdentityFailed;


const identityInitialState: IdentityState = {
    part: StatePart.Identity,    
    type: OpState.Init
};


function identity(state=identityInitialState, action: IdentityState): IdentityState {
    if (action.part != StatePart.Identity) {
	return state;
    }
    
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


interface PublicCausesInit {
    part: StatePart.PublicCauses;
    type: OpState.Init;
}
interface PublicCausesLoading {
    part: StatePart.PublicCauses;
    type: OpState.Loading;
}
interface PublicCausesReady {
    part: StatePart.PublicCauses;
    type: OpState.Ready;
    publicCauses: PublicCause[];
}
interface PublicCausesFailed {
    part: StatePart.PublicCauses;
    type: OpState.Failed;
    errorMessage: string;
}

export type PublicCausesState = PublicCausesInit | PublicCausesLoading | PublicCausesReady | PublicCausesFailed;

const publicCausesInitialState: PublicCausesState = {
    part: StatePart.PublicCauses,
    type: OpState.Init
};


function publicCauses(state=publicCausesInitialState, action: PublicCausesState): PublicCausesState {
    if (action.part != StatePart.PublicCauses) {
	return state;
    }
    
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
    identity: identity,
    publicCauses: publicCauses
});


export const store = createStore(reducers);
