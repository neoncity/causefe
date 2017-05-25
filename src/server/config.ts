import { readFileSync } from 'fs'

import { Env, parseEnv, isLocal } from '@neoncity/common-js/env'

export const ENV:Env = parseEnv(process.env.ENV);
export const ADDRESS:string = process.env.ADDRESS;
export const PORT:number = parseInt(process.env.PORT, 10);
export const IDENTITY_SERVICE_HOST:string = process.env.IDENTITY_SERVICE_HOST;
export const CORE_SERVICE_HOST:string = process.env.CORE_SERVICE_HOST;
export const IDENTITY_SERVICE_EXTERNAL_HOST:string = process.env.IDENTITY_SERVICE_EXTERNAL_HOST;
export const CORE_SERVICE_EXTERNAL_HOST:string = process.env.CORE_SERVICE_EXTERNAL_HOST;

export let AUTH0_CLIENT_ID: string;
export let AUTH0_CLIENT_SECRET: string;
export let AUTH0_DOMAIN: string;
export let AUTH0_CALLBACK_URI: string;
export let FILESTACK_KEY: string;
export let FACEBOOK_APP_ID:string;

if (isLocal(ENV)) {
    const secrets = JSON.parse(readFileSync(process.env.SECRETS_PATH, 'utf-8'));

    AUTH0_CLIENT_ID = secrets["AUTH0_CLIENT_ID"];
    AUTH0_CLIENT_SECRET = secrets["AUTH0_CLIENT_SECRET"];
    AUTH0_DOMAIN = secrets["AUTH0_DOMAIN"];
    AUTH0_CALLBACK_URI = secrets["AUTH0_CALLBACK_URI"];
    FILESTACK_KEY = secrets["FILESTACK_KEY"];
    FACEBOOK_APP_ID = secrets["FACEBOOK_APP_ID"];
} else {
    AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
    AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
    AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
    AUTH0_CALLBACK_URI = process.env.AUTH0_CALLBACK_URI;
    FILESTACK_KEY = process.env.FILESTACK_KEY;
    FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
}
