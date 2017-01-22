import { Env, parseEnv } from '@neoncity/common-js/env';

export const ENV:Env = parseEnv(process.env.ENV);
export const ADDRESS:string = process.env.ADDRESS;
export const PORT:number = parseInt(process.env.PORT, 10);
export const IDENTITY_SERVICE_HOST:string = process.env.IDENTITY_SERVICE_HOST;
