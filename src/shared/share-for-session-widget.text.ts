import { Message, MessageWith2Arg } from './messages'

const moment = require('moment')


export const shared: MessageWith2Arg = {
    en: (causeTitle: string, timeCreated: Date) => `Shared "${causeTitle}" on ${moment(timeCreated).locale("en").fromNow()}`,
    ro: (causeTitle: string, timeCreated: Date) => `Am share-uit "${causeTitle}" la ${moment(timeCreated).locale("ro").fromNow()}`
};

export const details: Message = {
    en: "Details",
    ro: "Detalii"
};
