import * as React from 'react'

import { Picture, PictureSet } from '@neoncity/core-sdk-js'

//import './image-gallery-widget.less'


interface Props {
    pictureSet: PictureSet;
}


export class ImageGalleryWidget extends React.Component<Props, {}> {
    render() {
        const { pictures } = this.props.pictureSet;
        const picturesRegion = pictures.map((picture: Picture, pictureIndex: number) => {
            return (
                <p key={pictureIndex.toString()}>
                    <img src={picture.uri} className="image-gallery picture" />
                </p>
            );
        });

        return <div>{picturesRegion}</div>;
    }
}
