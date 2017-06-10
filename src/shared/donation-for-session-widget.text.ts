import { CurrencyAmount } from '@neoncity/core-sdk-js'

import { Message, MessageWith3Arg } from './messages'


export const donated: MessageWith3Arg = {
    en: (amount: CurrencyAmount, causeTitle: string, timeCreated: Date) => `Donated ${amount.amount} ${amount.currency.toString()} to ${causeTitle} on ${timeCreated}`,
    ro: (amount: CurrencyAmount, causeTitle: string, timeCreated: Date) => `Am donat ${amount.amount} ${amount.currency.toString()} pentru ${causeTitle} la ${timeCreated}`
};

export const details: Message = {
    en: "Details",
    ro: "Detalii"
};
