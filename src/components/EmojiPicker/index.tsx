import React, { Component } from "react";
import { Picker, PickerProps, CustomEmoji } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

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
