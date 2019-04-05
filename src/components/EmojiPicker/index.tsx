import React, { Component } from 'react';
import {Picker, PickerProps, CustomEmoji} from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

interface IEmojiPickerProps extends PickerProps {
    onGetEmoji: any;
}

export class EmojiPicker extends Component<IEmojiPickerProps, any> {
    
    retrieveFromLocal() {
        return JSON.parse(localStorage.getItem("emojis") as string);
    }

    render() {
        return (
            <Picker
                custom={this.retrieveFromLocal()}
                emoji="point_up"
                title="Pick an emoji"
                onClick={this.props.onGetEmoji}
            />
        )
    }

}

export default EmojiPicker;