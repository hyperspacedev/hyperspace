import React, {Component} from 'react';
import { Dialog, DialogContent, DialogActions, withStyles, Button, CardHeader, Avatar, TextField, Toolbar, IconButton, Fade, Typography, Tooltip, Menu, MenuItem } from '@material-ui/core';
import {styles} from './Compose.styles';
import { UAccount } from '../types/Account';
import { Visibility } from '../types/Visibility';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import TagFacesIcon from '@material-ui/icons/TagFaces';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import VisibilityIcon from '@material-ui/icons/Visibility';
import WarningIcon from '@material-ui/icons/Warning';
import Mastodon from 'megalodon';
import {withSnackbar} from 'notistack';
import { Attachment } from '../types/Attachment';
import { PollWizard } from '../types/Poll';
import filedialog from 'file-dialog';


interface IComposerState {
    account: UAccount;
    visibility: Visibility;
    sensitive: boolean;
    sensitiveText?: string;
    visibilityMenu: boolean;
    text: string;
    remainingChars: number;
    reply?: string;
    acct?: string;
    attachments?: [Attachment];
    poll?: PollWizard;
}

class Composer extends Component<any, IComposerState> {

    client: Mastodon;
    
    constructor(props: any) {
        super(props);

        this.client = new Mastodon(localStorage.getItem('access_token') as string, localStorage.getItem('baseurl') + "/api/v1");

        this.state = {
            account: JSON.parse(localStorage.getItem('account') as string),
            visibility: "public",
            sensitive: false,
            visibilityMenu: false,
            text: '',
            remainingChars: 500
        }
    }

    updateTextFromField(text: string) {
        this.setState({ text, remainingChars: 500 - text.length });
    }

    updateWarningFromField(sensitiveText: string) {
        this.setState({ sensitiveText });
    }

    changeVisibility(visibility: Visibility) {
        this.setState({ visibility });
    }
    
    uploadMedia() {
        filedialog({
            multiple: false,
            accept: "image/*, video/*"
        }).then((media: FileList) => {
            let mediaForm = new FormData();
            mediaForm.append('file', media[0]);
            const uploading = this.props.enqueueSnackbar("Uploading media...", { persist: true })
            this.client.post('/media', mediaForm).then((resp: any) => {
                let attachment: Attachment = resp.data;
                let attachments = this.state.attachments;
                if (attachments) {
                    attachments.push(attachment);
                } else {
                    attachments = [attachment];
                }
                this.setState({ attachments });
                this.props.closeSnackbar(uploading);
                this.props.enqueueSnackbar('Media uploaded.');
            }).catch((err: Error) => {
                this.props.enqueueSnackbar("Couldn't upload media: " + err.name);
            })
        }).catch((err: Error) => {
            this.props.enqueueSnackbar("Couldn't get media: " + err.name);
            console.error(err.message);
        });
    }

    getOnlyMediaIds() {
        let ids: string[] = [];
        if (this.state.attachments) {
            this.state.attachments.map((attachment: Attachment) => {
                ids.push(attachment.id);
            });
        }
        return ids;
    }

    post() {
        this.client.post('/statuses', {
            status: this.state.text,
            media_ids: this.getOnlyMediaIds(),
            visibility: this.state.visibility,
            sensitive: this.state.sensitive,
            spoiler_text: this.state.sensitiveText
        }).then(() => {
            this.props.enqueueSnackbar('Posted!');
            window.history.back();
        }).catch((err: Error) => {
            this.props.enqueueSnackbar("Couldn't post: " + err.name);
            console.log(err.message);
        })
    }

    toggleSensitive() {
        this.setState({ sensitive: !this.state.sensitive });
    }

    toggleVisibilityMenu() {
        this.setState({ visibilityMenu: !this.state.visibilityMenu });
    }

    render() {
        const {classes} = this.props;

        return (
            <Dialog open={true} maxWidth="sm" fullWidth={true} className={classes.dialog} onClose={() => window.history.back()}>
                <CardHeader 
                    avatar={
                        <Avatar src={this.state.account.avatar_static} />
                    }
                    title={`${this.state.account.display_name} (@${this.state.account.acct})`}
                    subheader={this.state.visibility.charAt(0).toUpperCase() + this.state.visibility.substr(1)}
                />
                <DialogContent className={classes.dialogContent}>
                    { 
                        this.state.sensitive? 
                            <Fade in={this.state.sensitive}>
                                <TextField
                                    variant="outlined"
                                    fullWidth 
                                    label="Content warning" 
                                    margin="dense"
                                    onChange={(event) => this.updateWarningFromField(event.target.value)}
                                ></TextField>
                            </Fade>: null
                    }
                    {
                        this.state.visibility === "direct"?
                            <Typography variant="caption" >
                                <WarningIcon className={classes.warningCaption}/> Don't forget to add the usernames of the accounts you want to message in your post.
                            </Typography>: null
                    }
                    
                    <TextField 
                        variant="outlined" 
                        multiline
                        fullWidth
                        placeholder="What's on your mind?"
                        margin="normal"
                        onChange={(event) => this.updateTextFromField(event.target.value)}
                        inputProps = {
                            {
                                maxLength: 500
                            }
                        }
                    />
                    <Typography variant="caption" className={this.state.remainingChars <= 100? classes.charsReachingLimit: null}>
                        {`${this.state.remainingChars} character${this.state.remainingChars === 1? '': 's'} remaining`}
                    </Typography>
                </DialogContent>
                <Toolbar className={classes.dialogActions}>
                    <Tooltip title="Add photos or videos">
                        <IconButton disabled={this.state.poll !== undefined} onClick={() => this.uploadMedia()} id="compose-media">
                            <CameraAltIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Insert emoji">
                        <IconButton id="compose-emoji">
                            <TagFacesIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Add a poll">
                        <IconButton disabled={this.state.attachments && this.state.attachments.length > 0} id="compose-poll">
                            <HowToVoteIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Change who sees your post">
                        <IconButton id="compose-visibility" onClick={() => this.toggleVisibilityMenu()}>
                            <VisibilityIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Set a content warning">
                        <IconButton onClick={() => this.toggleSensitive()} id="compose-warning">
                            <WarningIcon/>
                        </IconButton>
                    </Tooltip>
                    <Menu open={this.state.visibilityMenu} anchorEl={document.getElementById('compose-visibility')} onClose={() => this.toggleVisibilityMenu()}>
                        <MenuItem onClick={() => this.changeVisibility('direct')}>Direct (direct message)</MenuItem>
                        <MenuItem onClick={() => this.changeVisibility('private')}>Private (followers only)</MenuItem>
                        <MenuItem onClick={() => this.changeVisibility('unlisted')}>Unlisted</MenuItem>
                        <MenuItem onClick={() => this.changeVisibility('public')}>Public</MenuItem>
                    </Menu>
                </Toolbar>
                <DialogActions>
                    <Button color="secondary" onClick={() => this.post()}>Post</Button>
                </DialogActions>
            </Dialog>
        )
    }
}

export default withStyles(styles)(withSnackbar(Composer));