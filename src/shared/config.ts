import { getNamespace } from 'continuation-local-storage'
import { readFileSync } from 'fs'

import {
    Context,
    Env,
    isLocal,
    isOnServer,
    parseContext,
    parseEnv
} from '@neoncity/common-js'
import {
    CorePublicClient,
    CorePrivateClient
} from '@neoncity/core-sdk-js'
import { IdentityClient, Session } from '@neoncity/identity-sdk-js'

import { Auth0Client } from './auth0'
import { FileStorageClient } from './file-storage'


export const CLS_NAMESPACE_NAME: string = 'neoncity.request';

export const NAME: string = 'causefe';
export let ENV: Env;
export let CONTEXT: Context;
export let ADDRESS: string;
export let PORT: number;
export let IDENTITY_SERVICE_HOST: string;
export let CORE_SERVICE_HOST: string;
export let ORIGIN: string;
export let LOGOUT_ROUTE: string;
export let AUTH0_CLIENT_ID: string;
export let AUTH0_CLIENT_SECRET: string;
export let AUTH0_DOMAIN: string;
export let AUTH0_CALLBACK_URI: string;
export let LOGGLY_TOKEN: string | null;
export let LOGGLY_SUBDOMAIN: string | null;
export let ROLLBAR_SERVER_TOKEN: string | null;
export let ROLLBAR_CLIENT_TOKEN: string | null;
export let FILESTACK_KEY: string;
export let FACEBOOK_APP_ID: string;
export let SESSION: () => Session;
export let LANG: () => string;
export let IDENTITY_CLIENT: () => IdentityClient;
export let CORE_PUBLIC_CLIENT: () => CorePublicClient;
export let CORE_PRIVATE_CLIENT: () => CorePrivateClient;
export let FILE_STORAGE_CLIENT: () => FileStorageClient;
export let AUTH0_CLIENT: () => Auth0Client;
export let setServices: (identityClient: IdentityClient, corePublicClient: CorePublicClient, corePrivateClient: CorePrivateClient, fileStorageClient: FileStorageClient, auth0Client: Auth0Client) => void;

ENV = parseEnv(process.env.ENV);
CONTEXT = parseContext(process.env.CONTEXT);
ADDRESS = process.env.ADDRESS;
PORT = parseInt(process.env.PORT, 10);
IDENTITY_SERVICE_HOST = process.env.IDENTITY_SERVICE_HOST;
CORE_SERVICE_HOST = process.env.CORE_SERVICE_HOST;
ORIGIN = process.env.ORIGIN;
LOGOUT_ROUTE = '/real/auth-flow/logout';

SESSION = () => {
    const namespace = getNamespace(CLS_NAMESPACE_NAME);
    const session = namespace.get('SESSION');
    return session;
};

LANG = () => {
    const namespace = getNamespace(CLS_NAMESPACE_NAME);
    const lang = namespace.get('LANG');
    return lang;
};

CORE_PUBLIC_CLIENT = () => {
    throw new Error('Should not be invoked');
};

CORE_PRIVATE_CLIENT = () => {
    throw new Error('Should not be invoked');
};

FILE_STORAGE_CLIENT = () => {
    throw new Error('Should not be invoked');
};

AUTH0_CLIENT = () => {
    throw new Error('Should not be invoked');
};

setServices = (_identityClient: IdentityClient, _corePublicClient: CorePublicClient, _corePrivateClient: CorePrivateClient, _fileStorageClient: FileStorageClient, _auth0Client: Auth0Client) => {
    throw new Error('Should not be invoked');
};

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


if (isOnServer(ENV)) {
    LOGGLY_TOKEN = process.env.LOGGLY_TOKEN;
    LOGGLY_SUBDOMAIN = process.env.LOGGLY_SUBDOMAIN;
    ROLLBAR_SERVER_TOKEN = process.env.ROLLBAR_SERVER_TOKEN;
    ROLLBAR_CLIENT_TOKEN = process.env.ROLLBAR_CLIENT_TOKEN;
} else {
    LOGGLY_TOKEN = null;
    LOGGLY_SUBDOMAIN = null;
    ROLLBAR_SERVER_TOKEN = null;
    ROLLBAR_CLIENT_TOKEN = null;
}
