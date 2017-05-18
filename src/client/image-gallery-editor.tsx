import { MarshalFrom } from 'raynor'
import * as React from 'react'

import { isLocal } from '@neoncity/common-js/env'
import { Picture, PictureSet } from '@neoncity/core-sdk-js'

import * as config from './config'
import './image-gallery-editor.less'
import { UserInput, UserInputMaster } from './user-input'


interface Props {
    pictureSet: PictureSet;
    selectPicture: (position: number) => Promise<Picture>;
    onPictureSetChange: (newPictureSet: PictureSet) => void;
}


interface State {
    hasSelectPictureError: boolean;
    pictures: UserInput<Picture, Picture>[];
}


export class ImageGalleryEditor extends React.Component<Props, State> {
    private readonly _pictureMaster: UserInputMaster<Picture, Picture>;

    constructor(props: Props, context: any) {
        super(props, context);
        this.state = this._fullStateFromProps(props);
        this._pictureMaster = new UserInputMaster<Picture, Picture>(new (MarshalFrom(Picture))());
    }

    componentWillReceiveProps(newProps: Props) {
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
                <button disabled={this.state.pictures.length >= PictureSet.MAX_NUMBER_OF_PICTURES} type="button" onClick={this._handleAddPicture.bind(this)}>Add</button>
                {selectPictureErrorRegion}
                {picturesRegion}
                </div>
        );
    }

    private _fullStateFromProps(props: Props): State {
        return {
            hasSelectPictureError: false,
            pictures: props.pictureSet.pictures.map(picture => new UserInput<Picture, Picture>(picture, picture))
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

        // Adjust positions. The in-place modification isn't that great.
        for (let i = 0; i < newPictures.length; i++) {
            newPictures[i].getValue().position = i + 1;
        }
        
        this.setState({hasSelectPictureError: false, pictures: newPictures}, this._updateOwner);
    }

    private _updateOwner() {
        const allValid = this.state.pictures.every(picture => !picture.isInvalid());

        if (allValid) {
            const pictureSet = new PictureSet();
            pictureSet.pictures = this.state.pictures.map(picture => picture.getValue());
            this.props.onPictureSetChange(pictureSet);
        }
    }
}