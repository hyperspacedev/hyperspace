import React, { Component } from "react";
import {
    Toolbar,
    IconButton,
    withStyles,
    LinearProgress,
    Tooltip
} from "@material-ui/core";

import FastRewindIcon from "@material-ui/icons/FastRewind";
import FastForwardIcon from "@material-ui/icons/FastForward";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";

import { styles } from "./AudioPlayer.styles";

interface IAudioPlayerProps {
    src: string;
    id: string;
    classes: any;
}

interface IAudioPlayerState {
    src: string;
    elementId: string;
    playing: boolean;
    progress: number;
}

class AudioPlayer extends Component<IAudioPlayerProps, IAudioPlayerState> {
    constructor(props: any) {
        super(props);

        this.state = {
            src: this.props.src,
            elementId: "audioplayer-" + this.props.id,
            playing: false,
            progress: 0
        };
    }

    componentDidMount() {
        let audioPlayerElement = this.getAudioPlayer();

        if (audioPlayerElement) {
            audioPlayerElement.ontimeupdate = () => {
                let music = audioPlayerElement as HTMLAudioElement;
                let progress = 100 * (music.currentTime / music.duration);
                this.setState({ progress });
            };
        }
    }

    getAudioPlayer(): HTMLAudioElement | null {
        return document.getElementById(
            this.state.elementId
        ) as HTMLAudioElement | null;
    }

    toggleAudio() {
        let audioPlayerElement = this.getAudioPlayer();

        if (audioPlayerElement && this.state.playing) {
            audioPlayerElement.pause();
            this.setState({ playing: false });
        } else if (audioPlayerElement) {
            audioPlayerElement.play();
            this.setState({ playing: true });
        }
    }

    fastForward() {
        let audioPlayerElement = this.getAudioPlayer();

        if (audioPlayerElement) {
            audioPlayerElement.currentTime += 15.0;
        }
    }

    rewind() {
        let audioPlayerElement = this.getAudioPlayer();

        if (audioPlayerElement) {
            audioPlayerElement.currentTime -= 15.0;
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <audio
                    id={this.state.elementId}
                    src={this.state.src}
                    autoPlay={false}
                />
                <Toolbar>
                    <Tooltip title="Rewind by 15s">
                        <IconButton onClick={() => this.rewind()}>
                            <FastRewindIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={this.state.playing ? "Pause" : "Play"}>
                        <IconButton onClick={() => this.toggleAudio()}>
                            {this.state.playing ? (
                                <PauseIcon />
                            ) : (
                                <PlayArrowIcon />
                            )}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Fast-forward by 15s">
                        <IconButton onClick={() => this.fastForward()}>
                            <FastForwardIcon />
                        </IconButton>
                    </Tooltip>
                    <LinearProgress
                        className={classes.progressBar}
                        variant="determinate"
                        color={"secondary"}
                        value={this.state.progress}
                    />
                    <Tooltip title="Download">
                        <IconButton
                            href={this.state.src}
                            target="_blank"
                            rel="noopener noreferrer nofollower"
                            className={classes.download}
                        >
                            <CloudDownloadIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </div>
        );
    }
}

export default withStyles(styles)(AudioPlayer);
