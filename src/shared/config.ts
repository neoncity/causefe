import { getNamespace } from 'continuation-local-storage'
import { readFileSync } from 'fs'
import { MarshalFrom } from 'raynor'

import {
    Context,
    Env,
    isLocal,
    isServer,
    parseContext,
    parseEnv } from '@neoncity/common-js'
import {
    CorePublicClient,
    CorePrivateClient } from '@neoncity/core-sdk-js'
import { Session } from '@neoncity/identity-sdk-js'

import { FileStorageClient } from './file-storage'
import { Auth0Client } from './auth0'


export const CLS_NAMESPACE_NAME:string = 'neoncity.request';

export let ENV:Env;
export let CONTEXT:Context;
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
export let LANG:() => string;
export let SESSION:() => Session;
export let CORE_PUBLIC_CLIENT:() => CorePublicClient;
export let CORE_PRIVATE_CLIENT:() => CorePrivateClient;
export let FILE_STORAGE_CLIENT:() => FileStorageClient;
export let AUTH0_CLIENT:() => Auth0Client;
export let setServices:(corePublicClient: CorePublicClient, corePrivateClient: CorePrivateClient, fileStorageClient: FileStorageClient, auth0Client: Auth0Client) => void;

if (isServer(parseContext(process.env.CONTEXT))) {
    ENV = parseEnv(process.env.ENV);
    CONTEXT = parseContext(process.env.CONTEXT);
    ADDRESS = process.env.ADDRESS;
    PORT = parseInt(process.env.PORT, 10);
    IDENTITY_SERVICE_HOST = process.env.IDENTITY_SERVICE_HOST;
    CORE_SERVICE_HOST = process.env.CORE_SERVICE_HOST;
    IDENTITY_SERVICE_EXTERNAL_HOST = process.env.IDENTITY_SERVICE_EXTERNAL_HOST;
    CORE_SERVICE_EXTERNAL_HOST = process.env.CORE_SERVICE_EXTERNAL_HOST;
    LOGOUT_ROUTE = '/real/auth-flow/logout';

    LANG = () => {
        const namespace = getNamespace(CLS_NAMESPACE_NAME);
        const lang = namespace.get('LANG');
        return lang;
    };

    SESSION = () => {
        const namespace = getNamespace(CLS_NAMESPACE_NAME);
        const session = namespace.get('SESSION');
        return session;
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

    setServices = (_corePublicClient: CorePublicClient, _corePrivateClient: CorePrivateClient, _fileStorageClient: FileStorageClient, _auth0Client: Auth0Client) => {
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
} else {
    const sessionMarshaller = new (MarshalFrom(Session))();

    const RAW_SESSION_FROM_SERVER = '{{{ SESSION }}}';
    const SESSION_FROM_SERVER = sessionMarshaller.extract(JSON.parse(RAW_SESSION_FROM_SERVER));

    let corePublicClient: CorePublicClient|null = null;
    let corePrivateClient: CorePrivateClient|null = null;
    let fileStorageClient: FileStorageClient|null = null;
    let auth0Client: Auth0Client|null = null;
    
    ENV = parseInt('{{{ ENV }}}') as Env;
    CONTEXT = parseInt('{{{ CONTEXT }}}') as Context;
    AUTH0_CLIENT_ID = '{{{ AUTH0_CLIENT_ID }}}';
    AUTH0_DOMAIN = '{{{ AUTH0_DOMAIN }}}';
    AUTH0_CALLBACK_URI = '{{{ AUTH0_CALLBACK_URI }}}';
    FILESTACK_KEY = '{{{ FILESTACK_KEY }}}';
    IDENTITY_SERVICE_EXTERNAL_HOST = '{{{ IDENTITY_SERVICE_EXTERNAL_HOST }}}';
    CORE_SERVICE_EXTERNAL_HOST = '{{{ CORE_SERVICE_EXTERNAL_HOST }}}';
    FACEBOOK_APP_ID = '{{{ FACEBOOK_APP_ID }}}';
    LOGOUT_ROUTE = '{{{ LOGOUT_ROUTE }}}';
    LANG = () => '{{{ LANG }}}';
    SESSION = () => SESSION_FROM_SERVER;

    CORE_PUBLIC_CLIENT = () => {
        if (corePublicClient == null) {
            throw new Error('Core public client not provided');
        }

        return corePublicClient;
    };

    CORE_PRIVATE_CLIENT = () => {
        if (corePrivateClient == null) {
            throw new Error('Core private client not provided');
        }

        return corePrivateClient;
    };

    FILE_STORAGE_CLIENT = () => {
        if (fileStorageClient == null) {
            throw new Error('File storage client not provided');
        }

        return fileStorageClient;
    };

    AUTH0_CLIENT = () => {
        if (auth0Client == null) {
            throw new Error('Auth0 client not provided');
        }

        return auth0Client;
    };

    setServices = (newCorePublicClient: CorePublicClient, newCorePrivateClient: CorePrivateClient, newFileStorageClient: FileStorageClient, newAuth0Client: Auth0Client) => {
        corePublicClient = newCorePublicClient;
        corePrivateClient = newCorePrivateClient;
        fileStorageClient = newFileStorageClient;
        auth0Client = newAuth0Client;
    };
}
