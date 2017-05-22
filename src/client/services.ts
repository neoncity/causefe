import { newCorePrivateClient, newCorePublicClient, CorePrivateClient, CorePublicClient } from '@neoncity/core-sdk-js'
import { newIdentityClient, IdentityClient } from '@neoncity/identity-sdk-js'

import * as config from './config'
import { FileStorageService } from './file-storage-service'


export const identityClient: IdentityClient = newIdentityClient(config.ENV, config.IDENTITY_SERVICE_EXTERNAL_HOST);
export const corePublicClient: CorePublicClient = newCorePublicClient(config.ENV, config.CORE_SERVICE_EXTERNAL_HOST);
export const corePrivateClient: CorePrivateClient = newCorePrivateClient(config.ENV, config.CORE_SERVICE_EXTERNAL_HOST);
export const fileStorageService = new FileStorageService(config.FILESTACK_KEY);
