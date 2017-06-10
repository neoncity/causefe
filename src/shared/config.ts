import { Env, parseEnv, isLocal } from '@neoncity/common-js'


export let ENV:Env;
export let ADDRESS:string;
export let PORT:number;
export let IDENTITY_SERVICE_HOST:string;
export let CORE_SERVICE_HOST:string;
export let IDENTITY_SERVICE_EXTERNAL_HOST:string;
export let CORE_SERVICE_EXTERNAL_HOST:string;
export let LOGOUT_ROUTE:string;
export let AUTH0_CLIENT_ID: string;
export let AUTH0_CLIENT_SECRET: string;
export let AUTH0_DOMAIN: string;
export let AUTH0_CALLBACK_URI: string;
export let FILESTACK_KEY: string;
export let FACEBOOK_APP_ID:string;
export let LANG:string;

if (process.env.CONTEXT == 'SERVER') {
    const readFileSync = require('fs').readFileSync;

    ENV = parseEnv(process.env.ENV);
    ADDRESS = process.env.ADDRESS;
    PORT = parseInt(process.env.PORT, 10);
    IDENTITY_SERVICE_HOST = process.env.IDENTITY_SERVICE_HOST;
    CORE_SERVICE_HOST = process.env.CORE_SERVICE_HOST;
    IDENTITY_SERVICE_EXTERNAL_HOST = process.env.IDENTITY_SERVICE_EXTERNAL_HOST;
    CORE_SERVICE_EXTERNAL_HOST = process.env.CORE_SERVICE_EXTERNAL_HOST;
    LOGOUT_ROUTE = '/real/auth-flow/logout';
    LANG = 'en';

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
} else {
    ENV = parseInt('{{{ ENV }}}');
    AUTH0_CLIENT_ID = '{{{ AUTH0_CLIENT_ID }}}';
    AUTH0_DOMAIN = '{{{ AUTH0_DOMAIN }}}';
    AUTH0_CALLBACK_URI = '{{{ AUTH0_CALLBACK_URI }}}';
    FILESTACK_KEY = '{{{ FILESTACK_KEY }}}';
    IDENTITY_SERVICE_EXTERNAL_HOST = '{{{ IDENTITY_SERVICE_EXTERNAL_HOST }}}';
    CORE_SERVICE_EXTERNAL_HOST = '{{{ CORE_SERVICE_EXTERNAL_HOST }}}';
    FACEBOOK_APP_ID = '{{{ FACEBOOK_APP_ID }}}';
    LOGOUT_ROUTE = '{{{ LOGOUT_ROUTE }}}';
    LANG = '{{{ LANG }}}';
}
