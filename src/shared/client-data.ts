import {
    ArrayOf,
    MarshalEnum,
    MarshalFrom,
    MarshalWith,
    OptionalOf } from 'raynor'
import * as r from 'raynor'

import { PublicCause } from '@neoncity/core-sdk-js'
import { Context, Env, LanguageMarshaller } from '@neoncity/common-js'
import { Session } from '@neoncity/identity-sdk-js'


export class ClientConfig {
    @MarshalWith(MarshalEnum(Env))
    env: Env;

    @MarshalWith(MarshalEnum(Context))
    context: Context;

    @MarshalWith(r.StringMarshaller)
    auth0ClientId: string;

    @MarshalWith(r.StringMarshaller)
    auth0Domain: string;

    @MarshalWith(r.WebUriMarshaller)
    auth0CallbackUri: string;

    @MarshalWith(r.StringMarshaller)
    fileStackKey: string;

    @MarshalWith(r.StringMarshaller)
    identityServiceExternalHost: string;

    @MarshalWith(r.StringMarshaller)
    coreServiceExternalHost: string;

    @MarshalWith(r.StringMarshaller)
    facebookAppId: string;

    @MarshalWith(r.AbsolutePathMarshaller)
    logoutRoute: string;

    @MarshalWith(LanguageMarshaller)
    language: string;

    @MarshalWith(MarshalFrom(Session))
    session: Session;
}


export class ClientInitialState {
    @MarshalWith(OptionalOf(ArrayOf(MarshalFrom(PublicCause))))
    publicCauses: PublicCause[]|null;

    @MarshalWith(OptionalOf(MarshalFrom(PublicCause)))
    publicCauseDetail: PublicCause|null;
}
