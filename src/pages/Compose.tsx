import React, {Component} from 'react';
import { Dialog, DialogContent, DialogActions, withStyles, Button, CardHeader, Avatar, TextField, Toolbar, IconButton, Fade, Typography, Tooltip, Menu, MenuItem, GridList, ListSubheader, GridListTile } from '@material-ui/core';
import {parse as parseParams, ParsedQuery} from 'query-string';
import {styles} from './Compose.styles';
import { UAccount } from '../types/Account';
import { Visibility } from '../types/Visibility';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import TagFacesIcon from '@material-ui/icons/TagFaces';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import VisibilityIcon from '@material-ui/icons/Visibility';
import WarningIcon from '@material-ui/icons/Warning';
import DeleteIcon from '@material-ui/icons/Delete';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import Mastodon from 'megalodon';
import {withSnackbar} from 'notistack';
import { Attachment } from '../types/Attachment';
import { PollWizard, PollWizardOption } from '../types/Poll';
import filedialog from 'file-dialog';
import ComposeMediaAttachment from '../components/ComposeMediaAttachment';
import EmojiPicker from '../components/EmojiPicker';
import { DateTimePicker, MuiPickersUtilsProvider } from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';
import { getUserDefaultVisibility } from '../utilities/settings';

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
    pollExpiresDate?: any;
    showEmojis: boolean;
}

class Composer extends Component<any, IComposerState> {

    client: Mastodon;
    
    constructor(props: any) {
        super(props);

        this.client = new Mastodon(localStorage.getItem('access_token') as string, localStorage.getItem('baseurl') + "/api/v1");

        this.state = {
            account: JSON.parse(localStorage.getItem('account') as string),
            visibility: getUserDefaultVisibility(),
            sensitive: false,
            visibilityMenu: false,
            text: '',
            remainingChars: 500,
            showEmojis: false
        }
    }

    componentDidMount() {
        let state = this.getComposerParams(this.props);
        let text = state.acct? `@${state.acct}: `: '';
        this.setState({
            reply: state.reply,
            acct: state.acct,
            visibility: state.visibility,
            text,
            remainingChars: 500 - text.length
        })
    }

    componentWillReceiveProps(props: any) {
        let state = this.getComposerParams(props);
        let text = state.acct? `@${state.acct}: `: '';
        this.setState({
            reply: state.reply,
            acct: state.acct,
            visibility: state.visibility,
            text,
            remainingChars: 500 - text.length
        })
    }

    checkComposerParams(location?: string): ParsedQuery {
        let params = "";
        if (location !== undefined && typeof(location) === "string") {
            params = location.replace("#/compose", "");
        } else {
            params = window.location.hash.replace("#/compose", "");
        }
        return parseParams(params);
    }

    getComposerParams(props: any) {
        let params = this.checkComposerParams(props.location);
        let reply: string = "";
        let acct: string = "";
        let visibility= this.state.visibility;

        if (params.reply) {
            reply = params.reply.toString();
        }
        if (params.acct) {
            acct = params.acct.toString();
        }
        if (params.visibility) {
            visibility = params.visibility.toString() as Visibility;
        }
        return {
            reply,
            acct,
            visibility
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

    fetchAttachmentAfterUpdate(attachment: Attachment) {
        let attachments = this.state.attachments;
        if (attachments) {
            attachments.forEach((attach: Attachment) => {
                if (attach.id === attachment.id && attachments) {
                    attachments[attachments.indexOf(attach)] = attachment;
                }
            })
            this.setState({ attachments });
        }
    }

    deleteMediaAttachment(attachment: Attachment) {
        let attachments = this.state.attachments;
        if (attachments) {
            attachments.forEach((attach: Attachment) => {
                if (attach.id === attachment.id && attachments) {
                    attachments.splice(attachments.indexOf(attach), 1);
                }
                this.setState({ attachments });
            })
            this.props.enqueueSnackbar("Attachment removed.");
        }
    }

    insertEmoji(e: any) {
        if (e.custom) {
            let text = this.state.text + e.colons
            this.setState({ 
                text,
                remainingChars: 500 - text.length
            });
        } else {
            let text = this.state.text + e.native
            this.setState({ 
                text,
                remainingChars: 500 - text.length
            });
        }
    }

    createPoll() {
        if (this.state.poll === undefined) {
            let expiration = new Date();
            let current = new Date();
            expiration.setMinutes(expiration.getMinutes() + 30);
            let expiryDifference = (expiration.getTime() - current.getTime() / 1000);
            let temporaryPoll: PollWizard = {
                expires_at: expiryDifference.toString(),
                multiple: false,
                options: [{title: 'Option 1'}, {title: 'Option 2'}]
            }
            this.setState({
                poll: temporaryPoll,
                pollExpiresDate: expiration
            });
        }
    }

    addPollItem() {
        if (this.state.poll !== undefined && this.state.poll.options.length < 4) {
            let newOption = {title: 'New option'}
            let options = this.state.poll.options;
            let poll = this.state.poll;
            options.push(newOption);
            poll.options = options;
            poll.multiple = true;
            this.setState({
                poll: poll
            })
        } else if (this.state.poll && this.state.poll.options.length == 4) {
            this.props.enqueueSnackbar("You've reached the options limit in your poll.", { variant: 'error' })
        }
    }

    editPollItem(position: number, newTitle: any) {
        if (this.state.poll !== undefined) {
            let poll = this.state.poll;
            let options = this.state.poll.options;
            options.forEach((option: PollWizardOption) => {
                if (position === options.indexOf(option)) {
                    option.title = newTitle.target.value;
                }
            });
            poll.options = options;
            this.setState({
                poll: poll
            });
            this.props.enqueueSnackbar('Option edited.');
        }
    }

    removePollItem(item: string) {
        if (this.state.poll !== undefined && this.state.poll.options.length > 2) {
            let options = this.state.poll.options;
            let poll = this.state.poll;
            options.forEach((option: PollWizardOption) => {
                if (item === option.title) {
                    options.splice(options.indexOf(option), 1);
                }
            });
            poll.options = options;
            if (options.length === 2) {
                poll.multiple = false;
            }
            this.setState({
                poll: poll
            })
        } else if (this.state.poll && this.state.poll.options.length <= 2) {
            this.props.enqueueSnackbar('Polls must have at least two items.', { variant: 'error'} );
        }
    }

    setPollExpires(date: string) {
        let currentDate = new Date();
        let newDate = new Date(date);
        let poll = this.state.poll;
        if (poll) {
            let expiry = ((newDate.getTime() - currentDate.getTime()) / 1000);
            console.log(expiry);
            if (expiry >= 1800) {
                poll.expires_at = expiry.toString();
                this.setState({ poll, pollExpiresDate: date });
                this.props.enqueueSnackbar("Expiration updated.")
            } else {
                this.props.enqueueSnackbar("Expiration is too small (min. 30 minutes).", { variant: 'error' });
            }
        }
    }

    removePoll() {
        this.setState({
            poll: undefined
        });
    }

    postViaKeyboard(event: any) {
        if ((event.metaKey || event.ctrlKey) && event.keyCode === 13) {
            this.post();
        }
    }

    post() {
        let pollOptions: string[] = [];
        if (this.state.poll) {
            this.state.poll.options.forEach((option: PollWizardOption) => {
                pollOptions.push(option.title);
            })
        }
        this.client.post('/statuses', {
            status: this.state.text,
            media_ids: this.getOnlyMediaIds(),
            visibility: this.state.visibility,
            sensitive: this.state.sensitive,
            spoiler_text: this.state.sensitiveText,
            in_reply_to_id: this.state.reply,
            poll: this.state.poll? {
                options: pollOptions,
                expires_in: this.state.poll.expires_at,
                multiple: this.state.poll.multiple
            }: null
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

    toggleEmojis() {
        this.setState({ showEmojis: !this.state.showEmojis });
    }

    render() {
        const {classes} = this.props;
        console.log(this.state);

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
                        onKeyDown={(event) => this.postViaKeyboard(event)}
                        inputProps = {
                            {
                                maxLength: 500
                            }
                        }
                        value={this.state.text}
                    />
                    <Typography variant="caption" className={this.state.remainingChars <= 100? classes.charsReachingLimit: null}>
                        {`${this.state.remainingChars} character${this.state.remainingChars === 1? '': 's'} remaining`}
                    </Typography>
                    {
                        this.state.attachments && this.state.attachments.length > 0?
                            <div className={classes.composeAttachmentArea}>
                                <GridList cellHeight={48} className={classes.composeAttachmentAreaGridList}>
                                    <GridListTile key="Subheader-composer" cols={2} style={{ height: 'auto' }}>
                                        <ListSubheader>Attachments</ListSubheader>
                                    </GridListTile>
                                    {
                                            this.state.attachments.map((attachment: Attachment) => {
                                                let c = <ComposeMediaAttachment
                                                            client={this.client}
                                                            attachment={attachment}
                                                            onAttachmentUpdate={(attachment: Attachment) => this.fetchAttachmentAfterUpdate(attachment)}
                                                            onDeleteCallback={(attachment: Attachment) => this.deleteMediaAttachment(attachment)}
                                                        />;
                                                return (c);
                                            })
                                    }
                                </GridList>
                            </div>: null
                    }
                    {
                        this.state.poll?
                        <div style={{ marginTop: 4}}>
                            
                                {
                                    this.state.poll?
                                        this.state.poll.options.map((option: PollWizardOption, index: number) => {
                                            let c = <div style={{ display: "flex" }} key={"compose_option_" + index.toString()}>
                                                <RadioButtonCheckedIcon className={classes.pollWizardOptionIcon}/>
                                                <TextField
                                                    onBlur={(event: any) => this.editPollItem(index, event)}
                                                    defaultValue={option.title}/>
                                                <div className={classes.pollWizardFlexGrow}/>
                                                <Tooltip title="Remove poll option">
                                                    <IconButton onClick={() => this.removePollItem(option.title)}>
                                                        <DeleteIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                            return c;
                                        }): null
                                }
                                <div style={{ display: "flex"}}>
                                    <MuiPickersUtilsProvider utils={MomentUtils}>
                                        <DateTimePicker
                                            value={this.state.pollExpiresDate? this.state.pollExpiresDate: new Date()} 
                                            onChange={(date: any) => {
                                                this.setPollExpires(date.toISOString());
                                            }} 
                                            label="Poll exipres on"
                                            disablePast
                                        />
                                    </MuiPickersUtilsProvider>
                                    <div className={classes.pollWizardFlexGrow}/>
                                    <Button onClick={() => this.addPollItem()}>Add Option</Button>
                                </div>
                        </div>: null
                    }
                </DialogContent>
                <Toolbar className={classes.dialogActions}>
                    <Tooltip title="Add photos or videos">
                        <IconButton disabled={this.state.poll !== undefined} onClick={() => this.uploadMedia()} id="compose-media">
                            <CameraAltIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Insert emoji">
                        <IconButton id="compose-emoji" onClick={() => this.toggleEmojis()} className={classes.desktopOnly}>
                            <TagFacesIcon/>
                        </IconButton>
                    </Tooltip>
                    <Menu
                        open={this.state.showEmojis}
                        anchorEl={document.getElementById('compose-emoji')}
                        onClose={() => this.toggleEmojis()}
                        className={classes.composeEmoji}
                    >
                        <EmojiPicker onGetEmoji={(emoji: any) => this.insertEmoji(emoji)}/>
                    </Menu>
                    <Tooltip title="Add/remove a poll">
                        <IconButton disabled={this.state.attachments && this.state.attachments.length > 0} id="compose-poll" onClick={() => {
                            this.state.poll?
                                this.removePoll():
                                this.createPoll()
                        }}>
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