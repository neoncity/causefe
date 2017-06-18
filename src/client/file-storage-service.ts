import { Picture } from '@neoncity/core-sdk-js'

import { FileStorageClient } from '../shared/file-storage'


export class FileStorageService implements FileStorageClient {

    private readonly _key: string;

    constructor(key: string) {
        this._key = key;
    }

    selectImageWithWidget(position: number): Promise<Picture> {
        var _this = this;

        // Build the Promise flow by hand, rather using async here.
        return new Promise(
            (resolve, reject) => {
                // This generates an async chunk.
                require.ensure([], function(require) {
                    const filepicker = require('filepicker-js');
                        
                    (filepicker as any).setKey(_this._key);
                    (filepicker as any).pick({
                        mimetype: 'image/*',
                        services: ['CONVERT', 'COMPUTER', 'FACEBOOK', 'DROPBOX', 'FLICKR'],
                        conversions: ['crop', 'rotate', 'filter'],
                        imageDim: [1600, 900],
                        cropRatio: 16/9,
                        cropForce: true,
                    }, (blob: any) => {
		        (filepicker as any).convert(blob, {
			    width: 1600,
			    height: 900,
			    fit: 'scale',
			    format: 'jpg',
			    compress: true,
			    quality: 90,
		        }, (newBlob: any) => {
                            resolve({
                                position: position,
                                uri: newBlob.url,
                                width: 1600,
                                height: 900
                            });
                        }, (error: Error) => {
                            reject(error);
                        });
                    }, (error: Error) => {
                        reject(error);
                    });
                }, 'filepicker');
            });
    }
}
