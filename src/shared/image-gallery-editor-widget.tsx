import { MarshalFrom } from 'raynor'
import * as React from 'react'

import { Picture, PictureSet } from '@neoncity/core-sdk-js'

import * as config from './config'
import { UserInput, UserInputMaster } from './user-input'

import * as commonText from './common.text'
//import './image-gallery-editor-widget.less'
import * as text from './image-gallery-editor-widget.text'


interface Props {
    pictureSet: UserInput<PictureSet, PictureSet>;
    selectPicture: (position: number) => Promise<Picture>;
    onPictureSetChange: (newPictureSet: UserInput<PictureSet, PictureSet>) => void;
}


interface State {
    hasSelectPictureError: boolean;
    pictures: UserInput<Picture, Picture>[];
    modified: boolean;
    invalid: boolean;
}


export class ImageGalleryEditorWidget extends React.Component<Props, State> {
    private readonly _pictureMaster: UserInputMaster<Picture, Picture>;

    constructor(props: Props, context: any) {
        super(props, context);
        this.state = this._fullStateFromProps(props, false);
        this._pictureMaster = new UserInputMaster<Picture, Picture>(new (MarshalFrom(Picture))());
    }

    componentWillReceiveProps(newProps: Props) {
        this.setState(this._fullStateFromProps(newProps, true));
    }

    render() {
        const picturesRegion = this.state.pictures.map((picture, pictureIndex) => {
            return (
                <div key={pictureIndex.toString()} className="picture">
                    <img src={picture.getValue().uri} />
                    <button
                        className="action remove-button"
                        type="button"
                        onClick={() => this._handleRemovePicture(pictureIndex)}>
                        x
                    </button>
                </div>
            );
        });

        const noPicturesWarning = <p>{text.thereAreNoPictures[config.LANG()]}</p>;

        const mainRegion = this.state.pictures.length == 0 ? noPicturesWarning : picturesRegion;

        let modifiersRegion = <span></span>;
        if (this.state.invalid) {
            modifiersRegion = <span className="modifiers warning">{text.invalidPictures[config.LANG()]}</span>;
        } else if (this.state.modified) {
            modifiersRegion = <span className="modifiers modified">{text.modified[config.LANG()]}</span>;
        }

        let selectPictureErrorRegion = <span></span>;
        if (this.state.hasSelectPictureError) {
            selectPictureErrorRegion = <span>{text.errorAddingImage[config.LANG()]}</span>;
        }

        return (
            <div className="image-gallery-editor-widget">
                <h3>{text.widgetTitle[config.LANG()]} {modifiersRegion}</h3>
                <button
                    className="action add-picture"
                    type="button"
                    disabled={this.state.invalid || this.state.pictures.length > PictureSet.MAX_NUMBER_OF_PICTURES}
                    onClick={this._handleAddPicture.bind(this)}>
                    {commonText.add[config.LANG()]}
                </button>
                {selectPictureErrorRegion}
                <div className="picture-container">
                    {mainRegion}
                </div>
            </div>
        );
    }

    private _fullStateFromProps(props: Props, fromReupdate: boolean): State {
        if (!fromReupdate) {
            return {
                hasSelectPictureError: false,
                pictures: props.pictureSet.getValue().pictures.map(picture => new UserInput<Picture, Picture>(picture, picture)),
                modified: props.pictureSet.isModified(),
                invalid: props.pictureSet.isInvalid()
            };
        } else {
            if (props.pictureSet.isInvalid()) {
                return {
                    hasSelectPictureError: false,
                    pictures: this.state.pictures,
                    modified: props.pictureSet.isModified(),
                    invalid: props.pictureSet.isInvalid()
                };
            } else {
                return {
                    hasSelectPictureError: false,
                    pictures: props.pictureSet.getValue().pictures.map((picture, pictureIndex) => new UserInput<Picture, Picture>(picture, picture, this.state.pictures[pictureIndex].isModified())),
                    modified: props.pictureSet.isModified(),
                    invalid: props.pictureSet.isInvalid()
                };
            }
        }
    }

    private async _handleAddPicture() {
        try {
            const picture = await this.props.selectPicture(this.state.pictures.length + 1);
            const newPictures = this.state.pictures.concat(this._pictureMaster.transform(picture, picture));
            this.setState({
                hasSelectPictureError: false,
                modified: true,
                invalid: false,
                pictures: newPictures
            }, this._updateOwner);
        } catch (e) {
            // If the user canceled the dialog, we don't do nothing.
            if (e.hasOwnProperty('FPError') && e.hasOwnProperty('code') && e.code == 101) {
                return;
            }

            console.log(e);
            config.ROLLBAR_CLIENT().error(e);

            this.setState({
                hasSelectPictureError: true,
                modified: false,
                invalid: true
            });
        }
    }

    private _handleRemovePicture(pictureIndex: number) {
        const newPictures = this.state.pictures.slice(0);
        newPictures.splice(pictureIndex, 1);

        // Adjust positions. The in-place modification isn't that great.
        for (let i = 0; i < newPictures.length; i++) {
            newPictures[i].getValue().position = i + 1;
        }

        this.setState({
            hasSelectPictureError: false,
            modified: true,
            invalid: !newPictures.every(picture => !picture.isInvalid()),
            pictures: newPictures
        }, this._updateOwner);
    }

    private _updateOwner() {
        const pictureSet = new PictureSet();
        pictureSet.pictures = this.state.pictures.map(picture => picture.getValue());
        this.props.onPictureSetChange(new UserInput<PictureSet, PictureSet>(pictureSet, pictureSet, this.state.modified, this.state.invalid));
    }
}
