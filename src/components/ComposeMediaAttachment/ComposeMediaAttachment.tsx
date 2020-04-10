import React, { Component } from "react";
import {
    GridListTile,
    GridListTileBar,
    TextField,
    withStyles,
    IconButton
} from "@material-ui/core";
import { styles } from "./ComposeMediaAttachment.styles";
import { withSnackbar, withSnackbarProps } from "notistack";
import Mastodon from "megalodon";
import { Attachment } from "../../types/Attachment";
import DeleteIcon from "@material-ui/icons/Delete";

interface IComposeMediaAttachmentProps extends withSnackbarProps {
    classes: any;
    client: Mastodon;
    attachment: Attachment;
    onDeleteCallback: any;
    onAttachmentUpdate: any;
}

interface IComposeMediaAttachmentState {
    attachment: Attachment;
}

class ComposeMediaAttachment extends Component<
    IComposeMediaAttachmentProps,
    IComposeMediaAttachmentState
> {
    client: Mastodon;

    constructor(props: IComposeMediaAttachmentProps) {
        super(props);

        this.client = this.props.client;

        this.state = {
            attachment: this.props.attachment
        };
    }

    updateAttachmentText(text: string) {
        this.client
            .put(`/media/${this.state.attachment.id}`, { description: text })
            .then((resp: any) => {
                this.props.onAttachmentUpdate(resp.data);
                this.props.enqueueSnackbar("Description updated.");
            })
            .catch((err: Error) => {
                this.props.enqueueSnackbar(
                    "Couldn't update description: " + err.name
                );
            });
    }

    render() {
        const { classes, attachment } = this.props;
        return (
            <GridListTile className={classes.attachmentArea}>
                {attachment.type === "image" || attachment.type === "gifv" ? (
                    <img
                        src={attachment.url}
                        alt={
                            attachment.description ? attachment.description : ""
                        }
                    />
                ) : attachment.type === "video" ? (
                    <video autoPlay={false} src={attachment.url} />
                ) : (
                    <object
                        data={attachment.url}
                        aria-label={`Attachment: ${attachment.id}`}
                    />
                )}
                <GridListTileBar
                    classes={{ title: classes.attachmentBar }}
                    title={
                        <TextField
                            variant="filled"
                            label="Description"
                            margin="dense"
                            className={classes.attachmentText}
                            onBlur={event =>
                                this.updateAttachmentText(event.target.value)
                            }
                        ></TextField>
                    }
                    actionIcon={
                        <IconButton
                            color="inherit"
                            onClick={() =>
                                this.props.onDeleteCallback(
                                    this.state.attachment
                                )
                            }
                        >
                            <DeleteIcon />
                        </IconButton>
                    }
                />
            </GridListTile>
        );
    }
}

export default withStyles(styles)(withSnackbar(ComposeMediaAttachment));
