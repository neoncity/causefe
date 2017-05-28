import { MarshalFrom } from 'raynor'

import { Session } from '@neoncity/identity-sdk-js'


const sessionMarshaller = new (MarshalFrom(Session))();

export const SESSION:Session = sessionMarshaller.extract(JSON.parse('{{{ SESSION }}}'));
