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
import { IdentityClient, Session } from '@neoncity/identity-sdk-js'

import { Auth0Client } from './auth0'
import { FileStorageClient } from './file-storage'
import { ClientConfig } from '../shared/client-data'


export const CLS_NAMESPACE_NAME:string = 'neoncity.request';

export let ENV:Env;
export let CONTEXT:Context;
export let ADDRESS:string;
export let PORT:number;
export let IDENTITY_SERVICE_HOST:string;
export let CORE_SERVICE_HOST:string;
export let IDENTITY_SERVICE_EXTERNAL_HOST:string;
export let CORE_SERVICE_EXTERNAL_HOST:string;
export let ORIGIN:string;
export let LOGOUT_ROUTE:string;
export let AUTH0_CLIENT_ID: string;
export let AUTH0_CLIENT_SECRET: string;
export let AUTH0_DOMAIN: string;
export let AUTH0_CALLBACK_URI: string;
export let FILESTACK_KEY: string;
export let FACEBOOK_APP_ID:string;
export let SESSION:() => Session;
export let LANG:() => string;
export let IDENTITY_CLIENT:() => IdentityClient;
export let CORE_PUBLIC_CLIENT:() => CorePublicClient;
export let CORE_PRIVATE_CLIENT:() => CorePrivateClient;
export let FILE_STORAGE_CLIENT:() => FileStorageClient;
export let AUTH0_CLIENT:() => Auth0Client;
export let setServices:(identityClient: IdentityClient, corePublicClient: CorePublicClient, corePrivateClient: CorePrivateClient, fileStorageClient: FileStorageClient, auth0Client: Auth0Client) => void;

if (isServer(parseContext(process.env.CONTEXT))) {
    ENV = parseEnv(process.env.ENV);
    CONTEXT = parseContext(process.env.CONTEXT);
    ADDRESS = process.env.ADDRESS;
    PORT = parseInt(process.env.PORT, 10);
    IDENTITY_SERVICE_HOST = process.env.IDENTITY_SERVICE_HOST;
    CORE_SERVICE_HOST = process.env.CORE_SERVICE_HOST;
    IDENTITY_SERVICE_EXTERNAL_HOST = process.env.IDENTITY_SERVICE_EXTERNAL_HOST;
    CORE_SERVICE_EXTERNAL_HOST = process.env.CORE_SERVICE_EXTERNAL_HOST;
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
} else {
    const clientConfigMarshaller = new (MarshalFrom(ClientConfig))();

    const clientConfig = clientConfigMarshaller.extract((window as any).__NEONCITY_CLIENT_CONFIG);
    delete (window as any).__NEONCITY_CLIENT_CONFIG;

    let identityClient: IdentityClient|null = null;
    let corePublicClient: CorePublicClient|null = null;
    let corePrivateClient: CorePrivateClient|null = null;
    let fileStorageClient: FileStorageClient|null = null;
    let auth0Client: Auth0Client|null = null;
    
    ENV = clientConfig.env;
    CONTEXT = clientConfig.context;
    AUTH0_CLIENT_ID = clientConfig.auth0ClientId;
    AUTH0_DOMAIN = clientConfig.auth0Domain;
    AUTH0_CALLBACK_URI = clientConfig.auth0CallbackUri;
    FILESTACK_KEY = clientConfig.fileStackKey;
    IDENTITY_SERVICE_EXTERNAL_HOST = clientConfig.identityServiceExternalHost;
    CORE_SERVICE_EXTERNAL_HOST = clientConfig.coreServiceExternalHost;
    FACEBOOK_APP_ID = clientConfig.facebookAppId;
    LOGOUT_ROUTE = clientConfig.logoutRoute;
    SESSION = () => clientConfig.session;
    LANG = () => clientConfig.language;

    IDENTITY_CLIENT = () => {
        if (identityClient == null) {
            throw new Error('Identity client not provided');
        }

        return identityClient;
    };

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

    setServices = (newIdentityClient: IdentityClient, newCorePublicClient: CorePublicClient, newCorePrivateClient: CorePrivateClient, newFileStorageClient: FileStorageClient, newAuth0Client: Auth0Client) => {
        identityClient = newIdentityClient;
        corePublicClient = newCorePublicClient;
        corePrivateClient = newCorePrivateClient;
        fileStorageClient = newFileStorageClient;
        auth0Client = newAuth0Client;
    };
}
