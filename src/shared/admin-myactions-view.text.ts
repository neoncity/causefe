import { CurrencyAmount } from '@neoncity/core-sdk-js'

import { Message, MessageWith1Arg } from './messages'


export const pageTitle: Message = {
    en: "Admin - My Actions",
    ro: "Administrare - Acțiunile Mele"
};

export const donationsCount: MessageWith1Arg = {
    en: (donationsCount: number) => `Donations count: ${donationsCount}`,
    ro: (donationsCount: number) => `Numărul de donații: ${donationsCount}`,
};

export const amountsDonated: MessageWith1Arg = {
    en: (amount: CurrencyAmount) => `Donated a total of ${amount.amount} ${amount.currency.toString()}`,
    ro: (amount: CurrencyAmount) => `Ai donat în total ${amount.amount} ${amount.currency.toString()}`
};

export const sharesCount: MessageWith1Arg = {
    en: (sharesCount: number) => `Shares count: ${sharesCount}`,
    ro: (sharesCount: number) => `Numărul de share-uri: ${sharesCount}`,
};

export const donations: Message = {
    en: "Donations",
    ro: "Donații"
};

export const shares: Message = {
    en: "Shares",
    ro: "Share-uri"
};
