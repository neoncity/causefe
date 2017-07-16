import { CurrencyAmount } from '@neoncity/core-sdk-js'

import { Message, MessageWith3Arg } from './messages'

const moment = require('moment')


export const donated: MessageWith3Arg = {
    en: (amount: CurrencyAmount, causeTitle: string, timeCreated: Date) => `Donated ${amount.amount} ${amount.currency.toString()} to "${causeTitle}" ${moment(timeCreated).locale("en").fromNow()}`,
    ro: (amount: CurrencyAmount, causeTitle: string, timeCreated: Date) => `Ai donat ${amount.amount} ${amount.currency.toString()} pentru "${causeTitle}" cu ${moment(timeCreated).locale("ro").fromNow()}`
};

export const details: Message = {
    en: "Details",
    ro: "Detalii"
};
