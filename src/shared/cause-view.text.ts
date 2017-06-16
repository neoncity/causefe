import { MessageWith0Arg, MessageWith1Arg } from './messages'


export const pageTitleDefault: MessageWith0Arg = {
    en: "NeonCity - Cause",
    ro: "NeonCity - Cauză"
};

export const pageTitle: MessageWith1Arg = {
    en: (causeTitle) => causeTitle,
    ro: (causeTitle) => causeTitle
};

export const pageDescriptionDefault: MessageWith0Arg = {
    en: "A crowdfunding platform for social causes",
    ro: "O platformă de crowdfunding pentru cauze sociale"
};

export const pageDescription: MessageWith1Arg = {
    en: (causeDescription) => causeDescription,
    ro: (causeDescription) => causeDescription
};
