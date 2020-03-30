import React, { Component } from "react";
import { Picker, PickerProps } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

interface IEmojiPickerProps extends PickerProps {
    onGetEmoji: any;
}

export class EmojiPicker extends Component<IEmojiPickerProps, any> {
    retrieveFromLocal() {
        let emojiStorage = localStorage.getItem("emojis");
        if (emojiStorage != null) {
            return JSON.parse(emojiStorage as string);
        } else {
            return undefined;
        }
    }

    render() {
        return (
            <Picker
                custom={this.retrieveFromLocal()}
                emoji=""
                title=""
                onClick={this.props.onGetEmoji}
                style={{
                    borderColor: "transparent"
                }}
                perLine={10}
                emojiSize={20}
                set={"google"}
            />
        );
    }
}

export default EmojiPicker;
