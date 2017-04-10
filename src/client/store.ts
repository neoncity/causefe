import { createStore, combineReducers } from 'redux'

import { PublicCause, PrivateCause, UserActionsOverview } from '@neoncity/core-sdk-js'
import { User } from '@neoncity/identity-sdk-js'


export enum StatePart {
    Identity = 0,
    PublicCauses = 1,
    PublicCauseDetail = 2,
    AdminMyCause = 3,
    AdminMyActions = 4
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
    causes: PublicCause[];
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


interface PublicCauseDetailInit {
    part: StatePart.PublicCauseDetail;
    type: OpState.Init;
}
interface PublicCauseDetailLoading {
    part: StatePart.PublicCauseDetail;
    type: OpState.Loading;
}
interface PublicCauseDetailReady {
    part: StatePart.PublicCauseDetail;
    type: OpState.Ready;
    cause: PublicCause;
}
interface PublicCauseDetailFailed {
    part: StatePart.PublicCauseDetail;
    type: OpState.Failed;
    errorMessage: string;
}

export type PublicCauseDetailState = PublicCauseDetailInit | PublicCauseDetailLoading | PublicCauseDetailReady | PublicCauseDetailFailed;

const publicCauseDetailInitialState: PublicCauseDetailState = {
    part: StatePart.PublicCauseDetail,
    type: OpState.Init
};


function publicCauseDetail(state=publicCauseDetailInitialState, action: PublicCauseDetailState): PublicCauseDetailState {
    if (action.part != StatePart.PublicCauseDetail) {
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


interface AdminMyCauseInit {
    part: StatePart.AdminMyCause;
    type: OpState.Init;
}
interface AdminMyCauseLoading {
    part: StatePart.AdminMyCause;
    type: OpState.Loading;
}
interface AdminMyCauseReady {
    part: StatePart.AdminMyCause;
    type: OpState.Ready;
    hasCause: boolean;
    cause: PrivateCause|null;
}
interface AdminMyCauseFailed {
    part: StatePart.AdminMyCause;
    type: OpState.Failed;
    errorMessage: string;
}

export type AdminMyCauseState = AdminMyCauseInit | AdminMyCauseLoading | AdminMyCauseReady | AdminMyCauseFailed;

const adminMyCauseInitialState: AdminMyCauseState = {
    part: StatePart.AdminMyCause,
    type: OpState.Init
};


function adminMyCause(state=adminMyCauseInitialState, action: AdminMyCauseState): AdminMyCauseState {
    if (action.part != StatePart.AdminMyCause) {
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


interface AdminMyActionsInit {
    part: StatePart.AdminMyActions;
    type: OpState.Init;
}
interface AdminMyActionsLoading {
    part: StatePart.AdminMyActions;
    type: OpState.Loading;
}
interface AdminMyActionsReady {
    part: StatePart.AdminMyActions;
    type: OpState.Ready;
    userActionsOverview: UserActionsOverview;
}
interface AdminMyActionsFailed {
    part: StatePart.AdminMyActions;
    type: OpState.Failed;
    errorMessage: string;
}

export type AdminMyActionsState = AdminMyActionsInit | AdminMyActionsLoading | AdminMyActionsReady | AdminMyActionsFailed;

const adminMyActionsInitialState: AdminMyActionsState = {
    part: StatePart.AdminMyActions,
    type: OpState.Init
};


function adminMyActions(state=adminMyActionsInitialState, action: AdminMyActionsState): AdminMyActionsState {
    if (action.part != StatePart.AdminMyActions) {
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
    publicCauses: publicCauses,
    publicCauseDetail: publicCauseDetail,
    adminMyCause: adminMyCause,
    adminMyActions: adminMyActions
});


export const store = createStore(reducers);
