import { Message, MessageWith1Arg } from './messages'


export const pageTitleDefault: Message = {
    en: "NeonCity - Cause",
    ro: "NeonCity - Cauză"
};

export const pageTitle: MessageWith1Arg = {
    en: (causeTitle) => causeTitle,
    ro: (causeTitle) => causeTitle
};
