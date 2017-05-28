import { newCorePrivateClient, newCorePublicClient, CorePrivateClient, CorePublicClient } from '@neoncity/core-sdk-js'

import * as config from './config'
import { FileStorageService } from './file-storage-service'


export const corePublicClient: CorePublicClient = newCorePublicClient(config.ENV, config.CORE_SERVICE_EXTERNAL_HOST);
export const corePrivateClient: CorePrivateClient = newCorePrivateClient(config.ENV, config.CORE_SERVICE_EXTERNAL_HOST);
export const fileStorageService = new FileStorageService(config.FILESTACK_KEY);
