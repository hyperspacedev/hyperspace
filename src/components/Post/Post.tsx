import React from "react";
import {
    Avatar,
    Button,
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    CardHeader,
    CardMedia,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    FormControlLabel,
    IconButton,
    Menu,
    MenuItem,
    Radio,
    RadioGroup,
    Tooltip,
    Typography,
    withStyles
} from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import ReplyIcon from "@material-ui/icons/Reply";
import FavoriteIcon from "@material-ui/icons/Favorite";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import PublicIcon from "@material-ui/icons/Public";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import WarningIcon from "@material-ui/icons/Warning";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import GroupIcon from "@material-ui/icons/Group";
import ForumIcon from "@material-ui/icons/Forum";
import AlternateEmailIcon from "@material-ui/icons/AlternateEmail";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import { styles } from "./Post.styles";
import { Status } from "../../types/Status";
import { Tag } from "../../types/Tag";
import { Mention } from "../../types/Mention";
import { Visibility } from "../../types/Visibility";
import moment from "moment";
import AttachmentComponent from "../Attachment";
import Mastodon from "megalodon";
import {
    LinkableAvatar,
    LinkableChip,
    LinkableIconButton,
    LinkableMenuItem
} from "../../interfaces/overrides";
import { withSnackbar } from "notistack";
import ShareMenu from "./PostShareMenu";
import { emojifyString } from "../../utilities/emojis";
import { PollOption } from "../../types/Poll";

interface IPostProps {
    post: Status;
    classes: any;
    client: Mastodon;
    threadHeader: boolean;
}

interface IPostState {
    post: Status;
    media_slides?: number;
    menuIsOpen: boolean;
    myVote?: [number];
    deletePostDialog: boolean;
    myAccount?: string;
}

export class Post extends React.Component<any, IPostState> {
    client: Mastodon;

    constructor(props: any) {
        super(props);

        this.state = {
            post: this.props.post,
            media_slides:
                this.props.post.media_attachments.length > 0
                    ? this.props.post.media_attachments.length
                    : 0,
            menuIsOpen: false,
            deletePostDialog: false
        };

        this.client = this.props.client;
    }

    componentWillMount() {
        this.setState({
            myAccount: sessionStorage.getItem("id") as string
        });
    }

    shouldComponentUpdate(nextProps: any, nextState: any) {
        if (nextState === this.state) return false;
        return true;
    }

    togglePostMenu() {
        this.setState({ menuIsOpen: !this.state.menuIsOpen });
    }

    togglePostDeleteDialog() {
        this.setState({ deletePostDialog: !this.state.deletePostDialog });
    }

    deletePost() {
        this.client
            .del("/statuses/" + this.state.post.id)
            .then(() => {
                this.props.enqueueSnackbar(
                    "Post deleted. Refresh to see changes."
                );
            })
            .catch((err: Error) => {
                this.props.enqueueSnackbar("Couldn't delete post: " + err.name);
                console.error(err.message);
            });
    }

    findBiggestVote() {
        let poll = this.state.post.poll;
        let votes: number[] = [];
        let bv = "";
        if (poll) {
            poll.options.forEach((option: PollOption) => {
                votes.push(option.votes_count ? option.votes_count : 0);
            });
            let biggestVote = Math.max.apply(null, votes);
            poll.options.forEach((option: PollOption) => {
                if (option.votes_count === biggestVote) {
                    bv = option.title;
                }
            });
            return bv;
        } else {
            return "No poll option was the best.";
        }
    }

    captureVote(option: any) {
        let poll = this.state.post.poll;
        let pollIndex: number = 0;
        if (poll) {
            poll.options.forEach((pollOption: PollOption, index: number) => {
                if (pollOption.title === option) {
                    pollIndex = index;
                }
            });
        }
        this.setState({ myVote: [pollIndex] });
    }

    submitVote() {
        let poll = this.state.post.poll;
        if (poll) {
            this.client
                .post(`/polls/${poll.id}/votes`, { choices: this.state.myVote })
                .then((resp: any) => {
                    let post = this.state.post;
                    post.poll = resp.data;
                    this.setState({ post });
                    this.props.enqueueSnackbar("Vote submitted.");
                })
                .catch((err: Error) => {
                    this.props.enqueueSnackbar("Couldn't vote: " + err.name);
                    console.error(err.message);
                });
        }
    }

    materializeContent(status: Status) {
        const { classes } = this.props;

        const oldContent = document.createElement("div");
        oldContent.innerHTML = status.content;

        let anchors = oldContent.getElementsByTagName("a");

        Array.prototype.forEach.call(anchors, (link: HTMLAnchorElement) => {
            if (
                link.className.includes("mention") ||
                link.className.includes("hashtag")
            ) {
                link.removeAttribute("href");
            }
        });

        oldContent.innerHTML = emojifyString(
            oldContent.innerHTML,
            status.emojis,
            classes.postEmoji
        );

        return (
            <CardContent className={classes.postContent}>
                <div className={classes.mediaContainer}>
                    <Typography
                        paragraph
                        dangerouslySetInnerHTML={{
                            __html: oldContent.innerHTML
                        }}
                    />
                    {status.card ? (
                        <div className={classes.postCard}>
                            <Divider />
                            <CardActionArea
                                href={status.card.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <CardContent>
                                    <Typography
                                        gutterBottom
                                        variant="h6"
                                        component="h2"
                                    >
                                        {status.card.title}
                                    </Typography>
                                    <Typography>
                                        {status.card.description.slice(0, 500) +
                                            (status.card.description.length >
                                            500
                                                ? "..."
                                                : "") ||
                                            "No description provided. Click with caution."}
                                    </Typography>
                                </CardContent>
                                {status.card.image &&
                                status.media_attachments.length <= 0 ? (
                                    <CardMedia
                                        className={classes.postMedia}
                                        image={status.card.image}
                                    />
                                ) : (
                                    <span />
                                )}
                                <CardContent>
                                    <Typography>
                                        {status.card.provider_url ||
                                            status.card.author_url ||
                                            status.card.author_url}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                            <Divider />
                        </div>
                    ) : (
                        <span />
                    )}
                    {status.media_attachments.length > 0 ? (
                        <AttachmentComponent media={status.media_attachments} />
                    ) : (
                        <span />
                    )}
                    {status.poll ? (
                        status.poll.voted || status.poll.expired ? (
                            <div>
                                <Typography variant="caption">
                                    You can't vote on this poll. Below are the
                                    results of the poll.
                                </Typography>
                                <RadioGroup value={this.findBiggestVote()}>
                                    {status.poll.options.map(
                                        (pollOption: PollOption) => {
                                            return (
                                                <FormControlLabel
                                                    disabled
                                                    value={pollOption.title}
                                                    control={<Radio />}
                                                    label={`${pollOption.title} (${pollOption.votes_count} votes)`}
                                                    key={
                                                        pollOption.title +
                                                        pollOption.votes_count
                                                    }
                                                />
                                            );
                                        }
                                    )}
                                </RadioGroup>
                                {status.poll && status.poll.expired ? (
                                    <Typography variant="caption">
                                        This poll has expired.
                                    </Typography>
                                ) : (
                                    <Typography variant="caption">
                                        This poll will expire on{" "}
                                        {moment(
                                            status.poll.expires_at
                                                ? status.poll.expires_at
                                                : ""
                                        ).format("MMMM Do YYYY, [at] h:mm A")}
                                        .
                                    </Typography>
                                )}
                            </div>
                        ) : (
                            <div>
                                <RadioGroup
                                    onChange={(event: any, option: any) =>
                                        this.captureVote(option)
                                    }
                                >
                                    {status.poll.options.map(
                                        (pollOption: PollOption) => {
                                            return (
                                                <FormControlLabel
                                                    value={pollOption.title}
                                                    control={<Radio />}
                                                    label={pollOption.title}
                                                    key={
                                                        pollOption.title +
                                                        pollOption.votes_count
                                                    }
                                                />
                                            );
                                        }
                                    )}
                                </RadioGroup>
                                <Button
                                    color="primary"
                                    onClick={() => this.submitVote()}
                                >
                                    Vote
                                </Button>
                            </div>
                        )
                    ) : null}
                </div>
            </CardContent>
        );
    }

    spoilerContainsFlags(text: string): boolean {
        let unsafeFlags = ["NSFW", "nsfw", "lewd", "sex"];
        let result: boolean = false;
        unsafeFlags.forEach((flag: string) => {
            if (text.includes(flag)) {
                result = true;
            }
        });
        return result;
    }

    getSensitiveContent(spoiler_text: string, content: Status) {
        const { classes } = this.props;
        const warningText = spoiler_text || "Unmarked content";
        let icon;
        if (
            this.spoilerContainsFlags(spoiler_text) ||
            spoiler_text.includes("Spoiler") ||
            warningText === "Unmarked content"
        ) {
            icon = <WarningIcon className={classes.postWarningIcon} />;
        }
        return (
            <ExpansionPanel
                className={
                    this.spoilerContainsFlags(spoiler_text)
                        ? classes.nsfwCard
                        : classes.spoilerCard
                }
                color="inherit"
            >
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    color="inherit"
                >
                    {icon}
                    <Typography>{warningText}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails
                    className={classes.postContent}
                    color="inherit"
                >
                    {this.materializeContent(content)}
                </ExpansionPanelDetails>
            </ExpansionPanel>
        );
    }

    getReblogOfPost(of: Status | null) {
        if (of !== null) {
            return of.sensitive
                ? this.getSensitiveContent(of.spoiler_text, of)
                : this.materializeContent(of);
        } else {
            return null;
        }
    }

    getReblogAuthors(post: Status) {
        const { classes } = this.props;

        let author = post.reblog ? post.reblog.account : post.account;
        let emojis = author.emojis;
        let reblogger = post.reblog ? post.account : undefined;

        if (reblogger !== undefined) {
            emojis.concat(reblogger.emojis);
        }

        return (
            <>
                <span className={classes.postAuthorNameAndAccount}>
                    <span
                        className={classes.postAuthorName}
                        dangerouslySetInnerHTML={{
                            __html: emojifyString(
                                author.display_name || author.username,
                                emojis,
                                classes.postAuthorEmoji
                            )
                        }}
                    ></span>
                    <span
                        className={classes.postAuthorAccount}
                        dangerouslySetInnerHTML={{
                            __html:
                                "@" +
                                emojifyString(
                                    author.acct || author.username,
                                    emojis,
                                    classes.postAuthorEmoji
                                )
                        }}
                    ></span>
                </span>
                {reblogger ? (
                    <div>
                        <AutorenewIcon
                            fontSize="small"
                            className={classes.postReblogIcon}
                        />
                        <span
                            dangerouslySetInnerHTML={{
                                __html: emojifyString(
                                    reblogger.display_name ||
                                        reblogger.username,
                                    emojis,
                                    classes.postAuthorEmoji
                                )
                            }}
                        ></span>
                    </div>
                ) : null}
            </>
        );
    }

    getMentions(mention: [Mention]) {
        const { classes } = this.props;
        if (mention.length > 0) {
            return (
                <CardContent className={classes.postTags}>
                    <Typography variant="caption">Mentions</Typography>
                    {mention.map((person: Mention) => {
                        return (
                            <LinkableChip
                                avatar={
                                    <Avatar>
                                        <AlternateEmailIcon />
                                    </Avatar>
                                }
                                label={person.username}
                                key={
                                    this.state.post.id + "_mention_" + person.id
                                }
                                to={`/profile/${person.id}`}
                                className={classes.postMention}
                                clickable
                            />
                        );
                    })}
                </CardContent>
            );
        } else {
            return null;
        }
    }

    getTags(tags: [Tag]) {
        const { classes } = this.props;
        if (tags.length > 0) {
            return (
                <CardContent className={classes.postTags}>
                    <Typography variant="caption">Tags</Typography>
                    {tags.map((tag: Tag) => {
                        return (
                            <LinkableChip
                                avatar={
                                    <Avatar>
                                        <LocalOfferIcon />
                                    </Avatar>
                                }
                                label={tag.name}
                                key={this.state.post.id + "_tag_" + tag.name}
                                to={`/search?query=${tag.name}&type=tag`}
                                className={classes.postMention}
                                clickable
                            />
                        );
                    })}
                </CardContent>
            );
        } else {
            return null;
        }
    }

    showVisibilityIcon(visibility: Visibility) {
        const { classes } = this.props;
        switch (visibility) {
            case "public":
                return (
                    <Tooltip title="Public">
                        <PublicIcon className={classes.postTypeIcon} />
                    </Tooltip>
                );
            case "private":
                return (
                    <Tooltip title="Followers only">
                        <GroupIcon className={classes.postTypeIcon} />
                    </Tooltip>
                );
            case "unlisted":
                return (
                    <Tooltip title="Unlisted (invisible from public timeline)">
                        <VisibilityOffIcon className={classes.postTypeIcon} />
                    </Tooltip>
                );
        }
    }

    /**
     * Get the post's URL
     * @param post The post to get the URL from
     * @returns A string containing the post's URI
     */
    getMastodonUrl(post: Status) {
        return post.reblog ? post.reblog.uri : post.uri;
    }

    /**
     * Tell server a post has been un/favorited and update post state
     * @param post The post to un/favorite
     */
    async toggleFavorited(post: Status) {
        let action: string = post.favourited ? "unfavourite" : "favourite";
        try {
            // favorite the original post, not the reblog
            let resp: any = await this.client.post(
                `/statuses/${post.reblog ? post.reblog.id : post.id}/${action}`
            );
            // compensate for slow server update
            if (action === "unfavourite") {
                resp.data.favourites_count -= 1;
                // if you unlike both original and reblog before refresh
                // and the post has only one favorite:
                if (resp.data.favourites_count < 0) {
                    resp.data.favourites_count = 0;
                }
            }
            this.setState({ post: resp.data as Status });
        } catch (e) {
            this.props.enqueueSnackbar(`Could not ${action} post: ${e.name}`);
            console.error(e.message);
        }
    }

    /**
     * Tell server a post has been un/reblogged and update post state
     * @param post The post to un/reblog
     */
    async toggleReblogged(post: Status) {
        let action: string =
            post.reblogged || post.reblog ? "unreblog" : "reblog";
        try {
            // modify the original post, not the reblog
            let resp: any = await this.client.post(
                `/statuses/${post.reblog ? post.reblog.id : post.id}/${action}`
            );
            // compensate for slow server update
            if (action === "unreblog") {
                resp.data.reblogs_count -= 1;
            }
            if (resp.data.reblog) resp.data = resp.data.reblog;
            this.setState({ post: resp.data as Status });
        } catch (e) {
            this.props.enqueueSnackbar(`Could not ${action} post: ${e.name}`);
            console.error(e.message);
        }
    }

    showDeleteDialog() {
        return (
            <Dialog
                open={this.state.deletePostDialog}
                onClose={() => this.togglePostDeleteDialog()}
            >
                <DialogTitle id="alert-dialog-title">
                    Delete this post?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this post? This action
                        cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => this.togglePostDeleteDialog()}
                        color="primary"
                        autoFocus
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            this.deletePost();
                            this.togglePostDeleteDialog();
                        }}
                        color="primary"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    render() {
        const { classes } = this.props;
        const post = this.state.post;
        return (
            <Card
                className={classes.post}
                id={`post_${post.id}`}
                elevation={this.props.threadHeader ? 0 : 1}
            >
                <CardHeader
                    classes={{
                        content: classes.postHeaderContent,
                        title: classes.postHeaderTitle
                    }}
                    avatar={
                        <LinkableAvatar
                            to={`/profile/${
                                post.reblog
                                    ? post.reblog.account.id
                                    : post.account.id
                            }`}
                            src={
                                post.reblog
                                    ? post.reblog.account.avatar_static
                                    : post.account.avatar_static
                            }
                        />
                    }
                    action={
                        <Tooltip title="More" placement="left">
                            <IconButton
                                key={`${post.id}_submenu`}
                                id={`${post.id}_submenu`}
                                onClick={() => this.togglePostMenu()}
                            >
                                <MoreVertIcon />
                            </IconButton>
                        </Tooltip>
                    }
                    title={this.getReblogAuthors(post)}
                    subheader={moment(post.created_at).format(
                        "MMMM Do YYYY [at] h:mm A"
                    )}
                />
                {post.reblog ? this.getReblogOfPost(post.reblog) : null}
                {post.sensitive
                    ? this.getSensitiveContent(post.spoiler_text, post)
                    : post.reblog
                    ? null
                    : this.materializeContent(post)}
                {post.reblog && post.reblog.mentions.length > 0
                    ? this.getMentions(post.reblog.mentions)
                    : this.getMentions(post.mentions)}
                {post.reblog && post.reblog.tags.length > 0
                    ? this.getTags(post.reblog.tags)
                    : this.getTags(post.tags)}
                <CardActions>
                    <Tooltip title="Reply">
                        <LinkableIconButton
                            to={`/compose?reply=${
                                post.reblog ? post.reblog.id : post.id
                            }&visibility=${post.visibility}&acct=${
                                post.reblog
                                    ? post.reblog.account.acct
                                    : post.account.acct
                            }`}
                        >
                            <ReplyIcon />
                        </LinkableIconButton>
                    </Tooltip>
                    <Typography>
                        {post.reblog
                            ? post.reblog.replies_count
                            : post.replies_count}
                    </Typography>
                    <Tooltip title="Favorite">
                        <IconButton onClick={() => this.toggleFavorited(post)}>
                            <FavoriteIcon
                                className={
                                    post.reblog
                                        ? post.reblog.favourited
                                            ? classes.postDidAction
                                            : ""
                                        : post.favourited
                                        ? classes.postDidAction
                                        : ""
                                }
                            />
                        </IconButton>
                    </Tooltip>
                    <Typography>
                        {post.reblog
                            ? post.reblog.favourites_count
                            : post.favourites_count}
                    </Typography>
                    <Tooltip title="Boost">
                        <IconButton onClick={() => this.toggleReblogged(post)}>
                            <AutorenewIcon
                                className={
                                    post.reblog
                                        ? post.reblog.reblogged
                                            ? classes.postDidAction
                                            : ""
                                        : post.reblogged
                                        ? classes.postDidAction
                                        : ""
                                }
                            />
                        </IconButton>
                    </Tooltip>
                    <Typography>
                        {post.reblog
                            ? post.reblog.reblogs_count
                            : post.reblogs_count}
                    </Typography>
                    <Tooltip
                        className={classes.desktopOnly}
                        title="View thread"
                    >
                        <LinkableIconButton
                            to={`/conversation/${
                                post.reblog ? post.reblog.id : post.id
                            }`}
                        >
                            <ForumIcon />
                        </LinkableIconButton>
                    </Tooltip>
                    <Tooltip
                        className={classes.desktopOnly}
                        title="Open in Web"
                    >
                        <IconButton
                            href={this.getMastodonUrl(post)}
                            rel="noreferrer"
                            target="_blank"
                        >
                            <OpenInNewIcon />
                        </IconButton>
                    </Tooltip>
                    <div className={classes.postFlexGrow} />
                    <div className={classes.postTypeIconDiv}>
                        {this.showVisibilityIcon(post.visibility)}
                    </div>
                </CardActions>
                <Menu
                    id="postmenu"
                    anchorEl={document.getElementById(`${post.id}_submenu`)}
                    open={this.state.menuIsOpen}
                    onClose={() => this.togglePostMenu()}
                >
                    <ShareMenu
                        config={{
                            params: {
                                title: `@${post.account.username} posted on Mastodon: `,
                                text: post.content,
                                url: this.getMastodonUrl(post)
                            },
                            onShareSuccess: () =>
                                this.props.enqueueSnackbar("Post shared!", {
                                    variant: "success"
                                }),
                            onShareError: (error: Error) => {
                                if (error.name !== "AbortError")
                                    this.props.enqueueSnackbar(
                                        `Couldn't share post: ${error.name}`,
                                        { variant: "error" }
                                    );
                            }
                        }}
                    />
                    {post.reblog ? (
                        <div className={classes.postReblogMenu}>
                            <LinkableMenuItem
                                to={`/profile/${post.reblog.account.id}`}
                            >
                                View author profile
                            </LinkableMenuItem>
                            <LinkableMenuItem
                                to={`/profile/${post.account.id}`}
                            >
                                View reblogger profile
                            </LinkableMenuItem>
                        </div>
                    ) : (
                        <LinkableMenuItem to={`/profile/${post.account.id}`}>
                            View profile
                        </LinkableMenuItem>
                    )}
                    <div className={classes.mobileOnly}>
                        <Divider />
                        <LinkableMenuItem
                            to={`/conversation/${
                                post.reblog ? post.reblog.id : post.id
                            }`}
                        >
                            View thread
                        </LinkableMenuItem>
                        <MenuItem
                            component="a"
                            href={this.getMastodonUrl(post)}
                            rel="noreferrer"
                            target="_blank"
                        >
                            Open in Web
                        </MenuItem>
                    </div>
                    {this.state.myAccount &&
                    post.account.id === this.state.myAccount ? (
                        <div>
                            <Divider />
                            <MenuItem
                                onClick={() => this.togglePostDeleteDialog()}
                            >
                                Delete
                            </MenuItem>
                        </div>
                    ) : null}
                    {this.showDeleteDialog()}
                </Menu>
            </Card>
        );
    }
}

export default withStyles(styles)(withSnackbar(Post));
