import { Currency } from '@neoncity/common-js'

import { Message, MessageWith0Arg, MessageWith1Arg, MessageWith3Arg } from './messages'


export const siteName: MessageWith0Arg = {
    en: "NeonCity",
    ro: "NeonCity"
};

export const loading: Message = {
    en: "Loading ...",
    ro: "Se încarca"
};

export const loadingFailed: Message = {
    en: "Loading failed",
    ro: "Încarcarea a eșuat"
};

export const add: Message = {
    en: "Add",
    ro: "Adaugă"
};

export const remove: Message = {
    en: "Remove",
    ro: "Șterge"
};

export const adminMyCause: Message = {
    en: "My Cause",
    ro: "Cauza Mea"
};

export const adminCauseAnalytics: Message = {
    en: "Cause analytics",
    ro: "Statistici"
};

export const adminMyActions: Message = {
    en: "My Actions",
    ro: "Faptele Mele"
};

export const adminAccount: Message = {
    en: "Account",
    ro: "Cont"
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
