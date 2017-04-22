import { MarshalFrom } from 'raynor'
import * as React from 'react'

import { isLocal } from '@neoncity/common-js/env'
import { Picture } from '@neoncity/core-sdk-js'

import * as config from './config'
import './image-gallery.less'
import { UserInput, UserInputMaster } from './user-input'


interface ImageGalleryEditorProps {
    pictures: Picture[];
    selectPicture: (position: number) => Promise<Picture>;
    onPicturesChange: (newPictures: Picture[]) => void;
}


interface ImageGalleryEditorState {
    hasSelectPictureError: boolean;
    pictures: UserInput<Picture, Picture>[];
}


export class ImageGalleryEditor extends React.Component<ImageGalleryEditorProps, ImageGalleryEditorState> {
    private readonly _pictureMaster: UserInputMaster<Picture, Picture>;

    constructor(props: ImageGalleryEditorProps, context: any) {
        super(props, context);
        this.state = this._fullStateFromProps(props);
        this._pictureMaster = new UserInputMaster<Picture, Picture>(new (MarshalFrom(Picture))());
    }

    componentWillReceiveProps(newProps: ImageGalleryEditorProps) {
        this.setState(this._fullStateFromProps(newProps));
    }

    render() {
        const picturesRegion = this.state.pictures.map((picture, pictureIndex) => {
            let modifiedRegion = <span></span>;
            if (picture.isModified()) {
                modifiedRegion = <span>Modified</span>;
            }

            let warningRegion = <span></span>;
            if (picture.isInvalid()) {
                warningRegion = <span>Invalid image</span>;
            }

            return (
                    <p key={pictureIndex.toString()}>
                    <img src={picture.getValue().uri} className="image-gallery picture" />
                    {modifiedRegion} {warningRegion}
                    <button type="button" onClick={_ => this._handleRemovePicture(pictureIndex)}>Remove</button>
                    </p>
            );
        });

        let selectPictureErrorRegion = <span></span>;
        if (this.state.hasSelectPictureError) {
            selectPictureErrorRegion = <span>There was an error adding the picture</span>;
        }

        return (
                <div>
                <p>Pictures</p>
                <button type="button" onClick={this._handleAddPicture.bind(this)}>Add</button>
                {selectPictureErrorRegion}
                {picturesRegion}
                </div>
        );
    }

    private _fullStateFromProps(props: ImageGalleryEditorProps): ImageGalleryEditorState {
        return {
            hasSelectPictureError: false,
            pictures: props.pictures.map(picture => new UserInput<Picture, Picture>(picture, picture))
        };
    }

    private async _handleAddPicture() {
        try {
            const picture = await this.props.selectPicture(this.state.pictures.length + 1);
            const newPictures = this.state.pictures.concat(this._pictureMaster.transform(picture, picture));
            this.setState({hasSelectPictureError: false, pictures: newPictures}, this._updateOwner);
        } catch (e) {
            // If the user canceled the dialog, we don't do nothing.
            if (e.hasOwnProperty('FPError') && e.hasOwnProperty('code') && e.code == 101) {
                return;
            }
            
            if (isLocal(config.ENV)) {
                console.log(e);
            }

            this.setState({hasSelectPictureError: true});
        }
    }

    private _handleRemovePicture(pictureIndex: number) {
        const newPictures = this.state.pictures.slice(0);
        newPictures.splice(pictureIndex, 1);
        this.setState({hasSelectPictureError: false, pictures: newPictures}, this._updateOwner);
    }

    private _updateOwner() {
        const allValid = this.state.pictures.every(picture => !picture.isInvalid());

        if (allValid) {
            const pictures = this.state.pictures.map(picture => picture.getValue());
            this.props.onPicturesChange(pictures);
        }
    }
}


interface ImageGalleryProps {
    pictures: Picture[];
}


export class ImageGallery extends React.Component<ImageGalleryProps, null> {
    render() {
        const { pictures } = this.props;
        const picturesRegion = pictures.map((picture, pictureIndex) => {
            return <p key={pictureIndex.toString()}><img src={picture.uri} className="image-gallery picture" /></p>;
        });

        return <div>{picturesRegion}</div>;
    }
}
