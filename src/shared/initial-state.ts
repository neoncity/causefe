import { ArrayOf, MarshalFrom, MarshalWith, OptionalOf } from 'raynor'

import { PublicCause } from '@neoncity/core-sdk-js'


export class InitialState {
    @MarshalWith(OptionalOf(ArrayOf(MarshalFrom(PublicCause))))
    publicCauses: PublicCause[]|null;
}
