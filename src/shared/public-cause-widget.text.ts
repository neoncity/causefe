import { Currency } from '@neoncity/common-js'


import { Message, MessageWith0Arg, MessageWith1Arg, MessageWith3Arg } from './messages'


export const causePicture: MessageWith0Arg = {
    en: "Cause picture",
    ro: "Poza cauzei"
};

export const infoOnRaised: MessageWith3Arg = {
    en: (percentage: number, goalAmount: number, currency: Currency) => {
        return `${(percentage * 100).toFixed(0)}% of ${goalAmount} ${currency.toString()}`;
    },
    ro: (percentage: number, goalAmount: number, currency: Currency) => {
        return `${(percentage * 100).toFixed(0)}% din ${goalAmount} ${currency.toString()}`;
    }
};

export const daysLeft: MessageWith1Arg = {
    en: (daysLeft: number) => {
        if (daysLeft < 0) {
            return "Overtime";
        } else if (daysLeft == 1) {
            return "1 day left";
        } else {
            return `${daysLeft} days left`;
        }
    },
    ro: (daysLeft: number) => {
        if (daysLeft < 0) {
            return "În prelungiri";
        } else if (daysLeft == 1) {
            return "O singurã zi rãmasã";
        } else {
            return `${daysLeft} zile rãmase`;
        }
    }
};

export const donating: Message = {
    en: "Donating",
    ro: "Procesãm donația"
};

export const sharing: Message = {
    en: "Sharing",
    ro: "Procesãm share-ul"
};

export const ready: Message = {
    en: "Ready",
    ro: "Gata"
};

export const failed: Message = {
    en: "Failed",
    ro: "Am eșuat"
};

export const donate: Message = {
    en: "Donate",
    ro: "Donează"
};

export const share: Message = {
    en: "Share",
    ro: "Share"
};
