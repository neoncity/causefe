const filepicker = require('filepicker-js');

import { Picture } from '@neoncity/core-sdk-js'


export class FileStorageService {

    constructor(key: string) {
        filepicker.setKey(key);
    }

    selectImageWithWidget(position: number): Promise<Picture> {
        // Build the Promise flow by hand, rather using async here.
        return new Promise(
            (resolve, reject) => {
                filepicker.pick({
                    mimetype: 'image/*',
                    services: ['CONVERT', 'COMPUTER', 'FACEBOOK', 'DROPBOX', 'FLICKR'],
                    conversions: ['crop', 'rotate', 'filter'],
                    imageDim: [1600, 900],
                    cropRatio: 16/9,
                    cropForce: true,
                }, (blob: any) => {
		    filepicker.convert(blob, {
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
            });
    }
}
