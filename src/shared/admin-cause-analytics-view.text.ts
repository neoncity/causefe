import { Message, MessageWith1Arg, MessageWith2Arg } from './messages'


export const noCause: Message = {
    en: "There is no cause. Create one to see something here",
    ro: "Nu exista o cauză încă. Porniți una pentru a vedea ceva aici"
};

export const daysLeft: MessageWith1Arg = {
    en: (daysLeft: number) => `Days left: ${daysLeft}`,
    ro: (daysLeft: number) => `Zile rămase: ${daysLeft}`
};

export const donorsCount: MessageWith1Arg = {
    en: (donorsCount: number) => `Donors count: ${donorsCount}`,
    ro: (donorsCount: number) => `Numărul donatorilor: ${donorsCount}`
};

export const donationsCount: MessageWith1Arg = {
    en: (donationsCount: number) => `Donations count: ${donationsCount}`,
    ro: (donationsCount: number) => `Numărul donațiilor: ${donationsCount}`
};

export const donatedAmount: MessageWith2Arg = {
    en: (donationsAmount: number, donationsCurrency: string) => `Donated amount: ${donationsAmount} ${donationsCurrency}`,
    ro: (donationsAmount: number, donationsCurrency: string) => `Suma donată: ${donationsAmount} ${donationsCurrency}`
};

export const sharersCount: MessageWith1Arg = {
    en: (sharersCount: number) => `Sharers count: ${sharersCount}`,
    ro: (sharersCount: number) => `Numărul celor care au dat share: ${sharersCount}`
};

export const sharesCount: MessageWith1Arg = {
    en: (sharesCount: number) => `Shares count: ${sharesCount}`,
    ro: (sharesCount: number) => `Numărul de share-uri: ${sharesCount}`
};
