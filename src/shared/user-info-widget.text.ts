import { Message, MessageWith1Arg } from './messages'


export const user: MessageWith1Arg = {
    en: (name: string) => `User: ${name}`,
    ro: (name: string) => `Utilizator: ${name}`
};

export const login: Message = {
    en: "Login",
    ro: "Login"
};

export const logout: Message = {
    en: "Logout",
    ro: "Logout"
};
