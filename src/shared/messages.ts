export type MessageWith0Arg = {[key: string]: string};
export type MessageWith1Arg = {[key: string]: (arg1: any) => string}
export type MessageWith2Arg = {[key: string]: (arg1: any, arg2: any) => string}
export type MessageWith3Arg = {[key: string]: (arg1: any, arg2: any, arg3: any) => string}

export type Message = MessageWith0Arg|MessageWith1Arg|MessageWith2Arg|MessageWith3Arg
