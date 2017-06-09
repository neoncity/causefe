import { ArrayOf, MarshalFrom, MarshalWith, OptionalOf } from 'raynor'

import { Session } from '@neoncity/identity-sdk-js'
import { PublicCause } from '@neoncity/core-sdk-js'


export class InitialState {
    @MarshalWith(MarshalFrom(Session))
    session: Session;

    @MarshalWith(OptionalOf(ArrayOf(MarshalFrom(PublicCause))))
    publicCauses: PublicCause[]|null;
}
