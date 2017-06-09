import { MarshalFrom, MarshalWith } from 'raynor'

import { Session } from '@neoncity/identity-sdk-js'


export class InitialState {
    @MarshalWith(MarshalFrom(Session))
    session: Session;
}
