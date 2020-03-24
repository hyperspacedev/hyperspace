import React, { Component } from "react";
import {
    Dialog,
    DialogContent,
    DialogActions,
    withStyles,
    Button,
    CardHeader,
    Avatar,
    TextField,
    Toolbar,
    IconButton,
    Fade,
    Typography,
    Tooltip,
    Menu,
    MenuItem,
    GridList,
    ListSubheader,
    GridListTile
} from "@material-ui/core";
import { parse as parseParams, ParsedQuery } from "query-string";
import { styles } from "./Compose.styles";
import { UAccount } from "../types/Account";
import { Visibility } from "../types/Visibility";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import TagFacesIcon from "@material-ui/icons/TagFaces";
import HowToVoteIcon from "@material-ui/icons/HowToVote";
import VisibilityIcon from "@material-ui/icons/Visibility";
import WarningIcon from "@material-ui/icons/Warning";
import DeleteIcon from "@material-ui/icons/Delete";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import Mastodon from "megalodon";
import { withSnackbar } from "notistack";
import { Attachment } from "../types/Attachment";
import { PollWizard, PollWizardOption } from "../types/Poll";
import filedialog from "file-dialog";
import ComposeMediaAttachment from "../components/ComposeMediaAttachment";
import EmojiPicker from "../components/EmojiPicker";
import { DateTimePicker, MuiPickersUtilsProvider } from "material-ui-pickers";
import MomentUtils from "@date-io/moment";
import {
    getUserDefaultVisibility,
    getConfig,
    getUserDefaultBool
} from "../utilities/settings";
import { draftExists, writeDraft, loadDraft } from "../utilities/compose";

/**
 * The state for the Composer page.
 */
interface IComposerState {
    /**
     * The current user as an Account.
     */
    account: UAccount;

    /**
     * The visibility of the post.
     */
    visibility: Visibility;

    /**
     * Whether there should be a content warning.
     */
    sensitive: boolean;

    /**
     * The content warning message.
     */
    sensitiveText?: string;

    /**
     * Whether the visibility drop-down should be visible.
     */
    visibilityMenu: boolean;

    /**
     * The text contents of the post.
     */
    text: string;

    /**
     * The remaining amount of characters.
     */
    remainingChars: number;

    /**
     * An optional reply ID.
     */
    reply?: string;

    /**
     * The account to reply to, if it exists.
     */
    acct?: string;

    /**
     * An optional list of media attachments.
     */
    attachments?: [Attachment];

    /**
     * An optional poll for the post.
     */
    poll?: PollWizard;

    /**
     * The expiration date of a poll, if it exists.
     */
    pollExpiresDate?: any;

    /**
     * Whether the emoji picker should be visible.
     */
    showEmojis: boolean;

    /**
     * Whether or not the account's instance is federated.
     */
    federated: boolean;
}

/**
 * The Compose page contains all of the information to create a UI for post creation.
 */
class Composer extends Component<any, IComposerState> {
    /**
     * The Mastodon client to work with.
     */
    client: Mastodon;

    /**
     * Construct the Compose page by generating the Mastodon client and setting default values.
     * @param props The properties passed into the Compose component, usually the page queries.
     */
    constructor(props: any) {
        super(props);

        // Generate the Mastodon client
        this.client = new Mastodon(
            localStorage.getItem("access_token") as string,
            localStorage.getItem("baseurl") + "/api/v1"
        );

        // Set the initial state
        this.state = {
            account: JSON.parse(localStorage.getItem("account") as string),
            visibility: getUserDefaultVisibility(),
            sensitive: false,
            visibilityMenu: false,
            text: "",
            remainingChars: getUserDefaultBool("imposeCharacterLimit")
                ? 500
                : 9999999999999,
            showEmojis: false,
            federated: true
        };
    }

    /**
     * Run any additional state checks and setup once the page has mounted. This includes
     * parsing the query parameters and loading the configuration, as well as defining the
     * clipboard listener.
     */
    componentDidMount() {
        // Parse the parameters and get the account information if available.
        let state = this.getComposerParams(this.props);
        let text = state.acct ? `@${state.acct}: ` : "";
        this.client.get("/accounts/verify_credentials").then((resp: any) => {
            let account: UAccount = resp.data;
            this.setState({ account });
        });

        // Get the configuration and load the config values.
        getConfig().then((config: any) => {
            this.setState({
                federated: config.federation.allowPublicPosts,
                reply: state.reply,
                acct: state.acct,
                visibility: state.visibility,
                text,
                remainingChars: getUserDefaultBool("imposeCharacterLimit")
                    ? 500 - text.length
                    : 99999999
            });
        });

        // Attach the paste listener to listen for the clipboard and upload media
        // if possible.
        window.addEventListener("paste", (evt: Event) => {
            let thePasteEvent = evt as ClipboardEvent;
            let fileList: File[] = [];
            if (thePasteEvent.clipboardData != null) {
                let clipitems = thePasteEvent.clipboardData.items;
                if (clipitems !== undefined) {
                    for (let i = 0; i < clipitems.length; i++) {
                        if (clipitems[i].type.indexOf("image") !== -1) {
                            let clipfile = clipitems[i].getAsFile();
                            if (clipfile != null) {
                                fileList.push(clipfile);
                            }
                        }
                    }

                    if (fileList.length > 0) {
                        this.uploadMedia(fileList);
                    }
                }
            }
        });
    }

    /**
     * Reload the properties and set the state to those new properties. This usually
     * occurs when the page is either reloaded or changes but React doesn't see the
     * properties change.
     * @param props The properties passed into the Compose component, usually the page queries.
     */
    componentWillReceiveProps(props: any) {
        let state = this.getComposerParams(props);
        let text = state.acct ? `@${state.acct}: ` : "";
        this.setState({
            reply: state.reply,
            acct: state.acct,
            visibility: state.visibility,
            text,
            remainingChars: getUserDefaultBool("imposeCharacterLimit")
                ? 500 - text.length
                : 99999999
        });
    }

    /**
     * Check if there is unsaved text and store it as a draft.
     */
    componentWillUnmount() {
        if (this.state.text !== "") {
            writeDraft(
                this.state.text,
                this.state.reply ? Number(this.state.reply) : -999
            );
            this.props.enqueueSnackbar("Draft saved.");
        }
    }

    /**
     * Restore the draft from session storage and pre-load it into the state.
     */
    restoreDraft() {
        const draft = loadDraft();
        const text = draft.contents;
        const reply =
            draft.replyId !== -999 ? draft.replyId.toString() : undefined;
        this.setState({ text, reply });
        this.props.enqueueSnackbar("Restored draft.");
    }

    /**
     * Check the location string and attempt to parse it into a parsed query.
     * @param location The location string from React Router.
     * @returns The ParsedQuery object containing all of the parameters.
     */
    checkComposerParams(location?: string): ParsedQuery {
        let params = "";
        if (location !== undefined && typeof location === "string") {
            params = location.replace("#/compose", "");
        } else {
            params = window.location.hash.replace("#/compose", "");
        }
        return parseParams(params);
    }

    /**
     * Check the property's location string, parse it, and return it.
     * @param props The properties passed into the Compose component, usually the page queries.
     * @returns An object containing the reply ID, reply account, and visibility.
     */
    getComposerParams(props: any) {
        let params = this.checkComposerParams(props.location);
        let reply: string = "";
        let acct: string = "";
        let visibility = this.state.visibility;

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
        };
    }

    /**
     * Update the text in the state and calculate the remaining character length.
     * @param text The text to update the state to
     */
    updateTextFromField(text: string) {
        this.setState({
            text,
            remainingChars: getUserDefaultBool("imposeCharacterLimit")
                ? 500 - text.length
                : 99999999
        });
    }

    /**
     * Update the content warning text in the state
     * @param sensitiveText The text to update the state to
     */
    updateWarningFromField(sensitiveText: string) {
        this.setState({ sensitiveText });
    }

    /**
     * Update the visibility in the state
     * @param visibility The visibility to update the state to
     */
    changeVisibility(visibility: Visibility) {
        this.setState({ visibility });
    }

    /**
     * Open a file dialog to let the user choose files to upload to the server and then upload them.
     */
    promptMediaDialog() {
        filedialog({
            multiple: false,
            accept: ".jpeg,.jpg,.png,.gif,.webm,.mp4,.mov,.ogg,.wav,.mp3,.flac"
        })
            .then((media: FileList) => this.uploadMedia(media))
            .catch((err: Error) => {
                this.props.enqueueSnackbar("Couldn't get media: " + err.name, {
                    variant: "error"
                });
                console.error(err.message);
            });
    }

    /**
     * Upload a list of files to Mastodon as attachments. Reads the first item in the list.
     * This also updates the attachments state after a successful upload.
     * @param media The list of files (`FileList` or `File[]`) to send to Mastodon.
     */
    uploadMedia(media: FileList | File[]) {
        // Create a new FormData for Mastodon
        let mediaForm = new FormData();
        mediaForm.append("file", media[0]);

        // Let the user know we're uploading the file
        this.props.enqueueSnackbar("Uploading media...", {
            persist: true,
            key: "media-upload"
        });

        // Try to upload the media to the server.
        this.client
            .post("/media", mediaForm)

            // If we succeed, get the attachments and update the state.
            .then((resp: any) => {
                let attachment: Attachment = resp.data;
                let attachments = this.state.attachments;
                if (attachments) {
                    attachments.push(attachment);
                } else {
                    attachments = [attachment];
                }
                this.setState({ attachments });
                this.props.closeSnackbar("media-upload");
                this.props.enqueueSnackbar("Media uploaded.");
            })

            // If we fail, display an error.
            .catch((err: Error) => {
                this.props.closeSnackbar("media-upload");
                this.props.enqueueSnackbar(
                    "Couldn't upload media: " + err.name,
                    { variant: "error" }
                );
            });
    }

    /**
     * Iterate through the attachments and grab the attachments' IDs.
     * @returns A list of IDs as `string[]`
     */
    getOnlyMediaIds() {
        let ids: string[] = [];
        if (this.state.attachments) {
            return this.state.attachments.map(
                (attachment: Attachment) => attachment.id
            );
        }
        return ids;
    }

    /**
     * Update the list of attachments by inserting an attachment.
     * @param attachment The attachment to insert into the attachments list.
     */
    fetchAttachmentAfterUpdate(attachment: Attachment) {
        let attachments = this.state.attachments;
        if (attachments) {
            attachments.forEach((attach: Attachment) => {
                if (attach.id === attachment.id && attachments) {
                    attachments[attachments.indexOf(attach)] = attachment;
                }
            });
            this.setState({ attachments });
        }
    }

    /**
     * Remove an attachment from the list of attachments and update the state.
     * @param attachment The attachment to remove from the list
     */
    deleteMediaAttachment(attachment: Attachment) {
        let attachments = this.state.attachments;
        if (attachments) {
            attachments.forEach((attach: Attachment) => {
                if (attach.id === attachment.id && attachments) {
                    attachments.splice(attachments.indexOf(attach), 1);
                }
                this.setState({ attachments });
            });
            this.props.enqueueSnackbar("Attachment removed.");
        }
    }

    /**
     * Insert an emoji at the end of text string and update the state
     * @param e The emoji to insert into the text
     */
    insertEmoji(e: any) {
        if (e.custom) {
            let text = this.state.text + e.colons;
            this.setState({
                text,
                remainingChars: 500 - text.length
            });
        } else {
            let text = this.state.text + e.native;
            this.setState({
                text,
                remainingChars: 500 - text.length
            });
        }
    }

    /**
     * Create an empty poll.
     */
    createPoll() {
        if (this.state.poll === undefined) {
            let expiration = new Date();
            let current = new Date();
            expiration.setMinutes(expiration.getMinutes() + 30);
            let expiryDifference =
                expiration.getTime() - current.getTime() / 1000;
            let temporaryPoll: PollWizard = {
                expires_at: expiryDifference.toString(),
                multiple: false,
                options: [{ title: "Option 1" }, { title: "Option 2" }]
            };
            this.setState({
                poll: temporaryPoll,
                pollExpiresDate: expiration
            });
        }
    }

    /**
     * Insert a new poll item into the poll.
     */
    addPollItem() {
        if (
            this.state.poll !== undefined &&
            this.state.poll.options.length < 4
        ) {
            let newOption = { title: "New option" };
            let options = this.state.poll.options;
            let poll = this.state.poll;
            options.push(newOption);
            poll.options = options;
            poll.multiple = true;
            this.setState({
                poll: poll
            });
        } else if (this.state.poll && this.state.poll.options.length === 4) {
            this.props.enqueueSnackbar(
                "You've reached the options limit in your poll.",
                { variant: "error" }
            );
        }
    }

    /**
     * Edit an existing poll item with new text
     * @param position The position of the poll item in the list
     * @param newTitle The new text to update
     */
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
            this.props.enqueueSnackbar("Option edited.");
        }
    }

    /**
     * Removes a poll item from the poll
     * @param item The item to remove
     */
    removePollItem(item: string) {
        if (
            this.state.poll !== undefined &&
            this.state.poll.options.length > 2
        ) {
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
            });
        } else if (this.state.poll && this.state.poll.options.length <= 2) {
            this.props.enqueueSnackbar("Polls must have at least two items.", {
                variant: "error"
            });
        }
    }

    /**
     * Set the expiration date of the poll.
     * @param date The new expiration date
     */
    setPollExpires(date: string) {
        let currentDate = new Date();
        let newDate = new Date(date);
        let poll = this.state.poll;
        if (poll) {
            let expiry = (newDate.getTime() - currentDate.getTime()) / 1000;
            if (expiry >= 1800) {
                poll.expires_at = expiry.toString();
                this.setState({ poll, pollExpiresDate: date });
                this.props.enqueueSnackbar("Expiration updated.");
            } else {
                this.props.enqueueSnackbar(
                    "Expiration is too small (min. 30 minutes).",
                    { variant: "error" }
                );
            }
        }
    }

    /**
     * Remove the poll from the post.
     */
    removePoll() {
        this.setState({
            poll: undefined
        });
    }

    /**
     * Check if the user presses the Ctrl/Cmd+Enter key and post to the server if possible.
     * @param event The keyboard event
     */
    postViaKeyboard(event: any) {
        if ((event.metaKey || event.ctrlKey) && event.keyCode === 13) {
            this.post();
        }
    }

    /**
     * Send the post to Mastodon and return to the previous page, if possible.
     */
    post() {
        // First, finalize the poll.
        let pollOptions: string[] = [];
        if (this.state.poll) {
            this.state.poll.options.forEach((option: PollWizardOption) => {
                pollOptions.push(option.title);
            });
        }

        // Send a post request to Mastodon.
        this.client
            .post("/statuses", {
                status: this.state.text,
                media_ids: this.getOnlyMediaIds(),
                visibility: this.state.visibility,
                sensitive: this.state.sensitive,
                spoiler_text: this.state.sensitiveText,
                in_reply_to_id: this.state.reply,
                poll: this.state.poll
                    ? {
                          options: pollOptions,
                          expires_in: this.state.poll.expires_at,
                          multiple: this.state.poll.multiple
                      }
                    : null
            })

            // If we succeed, send a success message, clear the status
            // text field, and go back.
            .then(() => {
                this.props.enqueueSnackbar("Posted!");

                // This is necessary to prevent session drafts from saving
                // posts that were already posted.
                this.setState({ text: "" });

                window.history.back();
            })

            // Otherwise, show an error message and don't do anything.
            .catch((err: Error) => {
                this.props.enqueueSnackbar("Couldn't post: " + err.name);
                console.error(err.message);
            });
    }

    /**
     * Toggle the content warning section.
     */
    toggleSensitive() {
        this.setState({ sensitive: !this.state.sensitive });
    }

    /**
     * Toggle the visibility drop down menu.
     */
    toggleVisibilityMenu() {
        this.setState({ visibilityMenu: !this.state.visibilityMenu });
    }

    /**
     * Toggle the emoji picker.
     */
    toggleEmojis() {
        this.setState({ showEmojis: !this.state.showEmojis });
    }

    /**
     * Render all of the components on the page given a set of classes.
     */
    render() {
        const { classes } = this.props;

        return (
            <Dialog
                open={true}
                maxWidth="sm"
                fullWidth={true}
                className={classes.dialog}
                onClose={() => window.history.back()}
            >
                <CardHeader
                    avatar={<Avatar src={this.state.account.avatar_static} />}
                    title={`${this.state.account.display_name} (@${this.state.account.acct})`}
                    subheader={
                        this.state.visibility.charAt(0).toUpperCase() +
                        this.state.visibility.substr(1)
                    }
                />
                <DialogContent className={classes.dialogContent}>
                    {this.state.sensitive ? (
                        <Fade in={this.state.sensitive}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                label="Content warning"
                                margin="dense"
                                onChange={event =>
                                    this.updateWarningFromField(
                                        event.target.value
                                    )
                                }
                            />
                        </Fade>
                    ) : null}
                    {this.state.visibility === "direct" ? (
                        <Typography variant="caption">
                            <WarningIcon className={classes.warningCaption} />{" "}
                            Don't forget to add the usernames of the accounts
                            you want to message in your post.
                        </Typography>
                    ) : null}

                    <TextField
                        variant="outlined"
                        multiline
                        fullWidth
                        placeholder="What's on your mind?"
                        margin="normal"
                        onChange={event =>
                            this.updateTextFromField(event.target.value)
                        }
                        onKeyDown={event => this.postViaKeyboard(event)}
                        inputProps={{
                            maxLength: 500
                        }}
                        value={this.state.text}
                    />
                    {getUserDefaultBool("imposeCharacterLimit") ? (
                        <Typography
                            variant="caption"
                            className={
                                this.state.remainingChars <= 100
                                    ? classes.charsReachingLimit
                                    : null
                            }
                        >
                            {`${this.state.remainingChars} character${
                                this.state.remainingChars === 1 ? "" : "s"
                            } remaining`}
                        </Typography>
                    ) : (
                        <Typography variant="caption">
                            <WarningIcon className={classes.warningCaption} />{" "}
                            You have the character limit turned off. Make sure
                            that your post matches your instance's character
                            limit before posting.
                        </Typography>
                    )}

                    {this.state.attachments &&
                    this.state.attachments.length > 0 ? (
                        <div className={classes.composeAttachmentArea}>
                            <GridList
                                cellHeight={48}
                                className={
                                    classes.composeAttachmentAreaGridList
                                }
                            >
                                <GridListTile
                                    key="Subheader-composer"
                                    cols={2}
                                    style={{ height: "auto" }}
                                >
                                    <ListSubheader>Attachments</ListSubheader>
                                </GridListTile>
                                {this.state.attachments.map(
                                    (attachment: Attachment) => {
                                        let c = (
                                            <ComposeMediaAttachment
                                                client={this.client}
                                                attachment={attachment}
                                                onAttachmentUpdate={(
                                                    attachment: Attachment
                                                ) =>
                                                    this.fetchAttachmentAfterUpdate(
                                                        attachment
                                                    )
                                                }
                                                onDeleteCallback={(
                                                    attachment: Attachment
                                                ) =>
                                                    this.deleteMediaAttachment(
                                                        attachment
                                                    )
                                                }
                                            />
                                        );
                                        return c;
                                    }
                                )}
                            </GridList>
                        </div>
                    ) : null}
                    {this.state.poll ? (
                        <div style={{ marginTop: 4 }}>
                            {this.state.poll
                                ? this.state.poll.options.map(
                                      (
                                          option: PollWizardOption,
                                          index: number
                                      ) => {
                                          let c = (
                                              <div
                                                  style={{ display: "flex" }}
                                                  key={
                                                      "compose_option_" +
                                                      index.toString()
                                                  }
                                              >
                                                  <RadioButtonCheckedIcon
                                                      className={
                                                          classes.pollWizardOptionIcon
                                                      }
                                                  />
                                                  <TextField
                                                      onBlur={(event: any) =>
                                                          this.editPollItem(
                                                              index,
                                                              event
                                                          )
                                                      }
                                                      defaultValue={
                                                          option.title
                                                      }
                                                  />
                                                  <div
                                                      className={
                                                          classes.pollWizardFlexGrow
                                                      }
                                                  />
                                                  <Tooltip title="Remove poll option">
                                                      <IconButton
                                                          onClick={() =>
                                                              this.removePollItem(
                                                                  option.title
                                                              )
                                                          }
                                                      >
                                                          <DeleteIcon />
                                                      </IconButton>
                                                  </Tooltip>
                                              </div>
                                          );
                                          return c;
                                      }
                                  )
                                : null}
                            <div style={{ display: "flex" }}>
                                <MuiPickersUtilsProvider utils={MomentUtils}>
                                    <DateTimePicker
                                        value={
                                            this.state.pollExpiresDate
                                                ? this.state.pollExpiresDate
                                                : new Date()
                                        }
                                        onChange={(date: any) => {
                                            this.setPollExpires(
                                                date.toISOString()
                                            );
                                        }}
                                        label="Poll exipres on"
                                        disablePast
                                    />
                                </MuiPickersUtilsProvider>
                                <div className={classes.pollWizardFlexGrow} />
                                <Button onClick={() => this.addPollItem()}>
                                    Add Option
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
                <Toolbar className={classes.dialogActions}>
                    <Tooltip title="Add photos, videos, or audio">
                        <IconButton
                            disabled={this.state.poll !== undefined}
                            onClick={() => this.promptMediaDialog()}
                            id="compose-media"
                        >
                            <AttachFileIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Insert emoji">
                        <IconButton
                            id="compose-emoji"
                            onClick={() => this.toggleEmojis()}
                            className={classes.desktopOnly}
                        >
                            <TagFacesIcon />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        open={this.state.showEmojis}
                        anchorEl={document.getElementById("compose-emoji")}
                        onClose={() => this.toggleEmojis()}
                        className={classes.composeEmoji}
                    >
                        <EmojiPicker
                            onGetEmoji={(emoji: any) => this.insertEmoji(emoji)}
                        />
                    </Menu>
                    <Tooltip title="Add/remove a poll">
                        <IconButton
                            disabled={
                                this.state.attachments &&
                                this.state.attachments.length > 0
                            }
                            id="compose-poll"
                            onClick={() => {
                                this.state.poll
                                    ? this.removePoll()
                                    : this.createPoll();
                            }}
                        >
                            <HowToVoteIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Change who sees your post">
                        <IconButton
                            id="compose-visibility"
                            onClick={() => this.toggleVisibilityMenu()}
                        >
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Set a content warning">
                        <IconButton
                            onClick={() => this.toggleSensitive()}
                            id="compose-warning"
                        >
                            <WarningIcon />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        open={this.state.visibilityMenu}
                        anchorEl={document.getElementById("compose-visibility")}
                        onClose={() => this.toggleVisibilityMenu()}
                    >
                        <MenuItem
                            onClick={() => this.changeVisibility("direct")}
                        >
                            Direct (direct message)
                        </MenuItem>
                        <MenuItem
                            onClick={() => this.changeVisibility("private")}
                        >
                            Private (followers only)
                        </MenuItem>
                        <MenuItem
                            onClick={() => this.changeVisibility("unlisted")}
                        >
                            Unlisted
                        </MenuItem>
                        {this.state.federated ? (
                            <MenuItem
                                onClick={() => this.changeVisibility("public")}
                            >
                                Public
                            </MenuItem>
                        ) : null}
                    </Menu>
                </Toolbar>
                {draftExists() ? (
                    <DialogContent className={classes.draftDisplayArea}>
                        <Typography className={classes.draftText}>
                            You have an unsaved post.
                        </Typography>
                        <div className={classes.draftFlexGrow} />
                        <Button
                            color="primary"
                            size="small"
                            onClick={() => this.restoreDraft()}
                        >
                            Restore
                        </Button>
                    </DialogContent>
                ) : null}
                <DialogActions>
                    <Button color="secondary" onClick={() => this.post()}>
                        Post
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default withStyles(styles)(withSnackbar(Composer));
