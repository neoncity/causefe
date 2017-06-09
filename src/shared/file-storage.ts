import { Picture } from '@neoncity/core-sdk-js'


export interface FileStorageClient {
    selectImageWithWidget(position: number): Promise<Picture>;
}
