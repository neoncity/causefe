import { Message, MessageWith1Arg } from './messages'


export const pictureOf: MessageWith1Arg = {
    en: (name: string) => `Picture of ${name}`,
    ro: (name: string) => `Poza lui ${name}`
};

export const login: Message = {
    en: "Login",
    ro: "Login"
};

export const signup: Message = {
    en: "Signup",
    ro: "Alatură-te"
};

export const logout: Message = {
    en: "Logout",
    ro: "Logout"
};
