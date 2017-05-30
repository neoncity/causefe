import { MarshalFrom } from 'raynor'

import { Session, User } from '@neoncity/identity-sdk-js'


const sessionMarshaller = new (MarshalFrom(Session))();

export const SESSION:Session = sessionMarshaller.extract(JSON.parse('{{{ SESSION }}}'));
export let LANG:string = 'en';
if (SESSION.hasUser()) {
    LANG = (SESSION.user as User).language;
}
