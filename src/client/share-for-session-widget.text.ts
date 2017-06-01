import { Message, MessageWith2Arg } from './messages'


export const shared: MessageWith2Arg = {
    en: (causeTitle: string, timeCreated: Date) => `Shared ${causeTitle} on ${timeCreated}`,
    ro: (causeTitle: string, timeCreated: Date) => `Am share-uit ${causeTitle} la ${timeCreated}`
};

export const details: Message = {
    en: "Details",
    ro: "Detalii"
};
