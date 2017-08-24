import { MarshalFrom } from 'raynor'

import { Context, Env } from '@neoncity/common-js'
import {
    CorePublicClient,
    CorePrivateClient
} from '@neoncity/core-sdk-js'
import { IdentityClient, Session } from '@neoncity/identity-sdk-js'

import { Auth0Client } from '../shared/auth0'
import { FileStorageClient } from '../shared/file-storage'
import { ClientConfig } from '../shared/client-data'


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


const clientConfigMarshaller = new (MarshalFrom(ClientConfig))();

const clientConfig = clientConfigMarshaller.extract((window as any).__NEONCITY_CLIENT_CONFIG);
delete (window as any).__NEONCITY_CLIENT_CONFIG;

let identityClient: IdentityClient | null = null;
let corePublicClient: CorePublicClient | null = null;
let corePrivateClient: CorePrivateClient | null = null;
let fileStorageClient: FileStorageClient | null = null;
let auth0Client: Auth0Client | null = null;

ENV = clientConfig.env;
ORIGIN = clientConfig.origin;
CONTEXT = clientConfig.context;
AUTH0_CLIENT_ID = clientConfig.auth0ClientId;
AUTH0_DOMAIN = clientConfig.auth0Domain;
AUTH0_CALLBACK_URI = clientConfig.auth0CallbackUri;
LOGGLY_TOKEN = null;
LOGGLY_SUBDOMAIN = null;
ROLLBAR_SERVER_TOKEN = null;
ROLLBAR_CLIENT_TOKEN = clientConfig.rollbarClientToken;
FILESTACK_KEY = clientConfig.fileStackKey;
IDENTITY_SERVICE_HOST = clientConfig.identityServiceHost;
CORE_SERVICE_HOST = clientConfig.coreServiceHost;
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
