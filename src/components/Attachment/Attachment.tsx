import React, { Component } from "react";
import {
    withStyles,
    Typography,
    MobileStepper,
    Button
} from "@material-ui/core";
import { styles } from "./Attachment.styles";
import { Attachment } from "../../types/Attachment";
import AudioPlayer from "../AudioPlayer";
import SwipeableViews from "react-swipeable-views";

interface IAttachmentProps {
    media: [Attachment];
    classes?: any;
}

interface IAttachmentState {
    totalSteps: number;
    currentStep: number;
    attachments: [Attachment];
}

class AttachmentComponent extends Component<
    IAttachmentProps,
    IAttachmentState
> {
    constructor(props: IAttachmentProps) {
        super(props);

        this.state = {
            attachments: this.props.media,
            totalSteps: this.props.media.length,
            currentStep: 0
        };
    }

    moveBack() {
        let nextStep = this.state.currentStep - 1;
        if (nextStep < 0) {
            nextStep = 0;
        }
        this.setState({ currentStep: nextStep });
    }

    moveForward() {
        let nextStep = this.state.currentStep + 1;
        if (nextStep > this.state.totalSteps) {
            nextStep = this.state.totalSteps;
        }
        this.setState({ currentStep: nextStep });
    }

    handleStepChange(currentStep: number) {
        this.setState({
            currentStep
        });
    }

    getSlide(slide: Attachment) {
        const { classes } = this.props;
        switch (slide.type) {
            case "image":
                return (
                    <img
                        src={slide.url}
                        alt={slide.description ? slide.description : ""}
                        className={classes.mediaObject}
                    />
                );
            case "video":
                return (
                    <video
                        controls
                        autoPlay={false}
                        src={slide.url}
                        className={classes.mediaObject}
                    />
                );
            case "audio":
                return <AudioPlayer src={slide.url} id={slide.id} />;
            case "gifv":
                return (
                    <video
                        autoPlay
                        loop
                        src={slide.url}
                        title={slide.description ? slide.description : ""}
                        className={classes.mediaObject}
                    />
                );
            case "unknown":
                return (
                    <object
                        data={slide.url}
                        className={classes.mediaObject}
                        aria-label={`Slide: ${slide.id}`}
                    />
                );
        }
    }

    render() {
        const { classes } = this.props;
        const step = this.state.currentStep;
        const mediaItem = this.state.attachments[step];
        return (
            <div className={classes.mediaContainer}>
                <SwipeableViews index={this.state.currentStep}>
                    {this.state.attachments.map((slide: Attachment) => {
                        return (
                            <div key={slide.id} className={classes.mediaSlide}>
                                {this.getSlide(slide)}
                            </div>
                        );
                    })}
                </SwipeableViews>
                {this.state.totalSteps > 1 ? (
                    <MobileStepper
                        steps={this.state.totalSteps}
                        position="static"
                        activeStep={this.state.currentStep}
                        className={classes.mobileStepper}
                        nextButton={
                            <Button
                                size="small"
                                onClick={() => this.moveForward()}
                                disabled={
                                    this.state.currentStep ===
                                    this.state.totalSteps - 1
                                }
                            >
                                Next
                            </Button>
                        }
                        backButton={
                            <Button
                                size="small"
                                onClick={() => this.moveBack()}
                                disabled={this.state.currentStep === 0}
                            >
                                Back
                            </Button>
                        }
                    />
                ) : null}
                <br />
                <Typography variant="caption">
                    {mediaItem.description
                        ? mediaItem.description
                        : "No description provided."}
                </Typography>
            </div>
        );
    }
}

export default withStyles(styles)(AttachmentComponent);
