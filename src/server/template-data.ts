import { MarshalFrom } from 'raynor'

import { Session } from '@neoncity/identity-sdk-js'

import * as config from './config'


export function buildTemplateData(session: Session): any {
    const sessionMarshaller = new (MarshalFrom(Session))();
    return (Object as any).assign({}, config, {SESSION: JSON.stringify(sessionMarshaller.pack(session))});
}
