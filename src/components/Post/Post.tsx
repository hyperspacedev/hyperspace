import React from 'react';
import { Typography, IconButton, Card, CardHeader, Avatar, CardContent, CardActions, withStyles, Menu, MenuItem, Chip, Divider, CardMedia, CardActionArea, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Zoom, Tooltip } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ReplyIcon from '@material-ui/icons/Reply';
import FavoriteIcon from '@material-ui/icons/Favorite';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import PublicIcon from '@material-ui/icons/Public';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import WarningIcon from '@material-ui/icons/Warning';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import GroupIcon from '@material-ui/icons/Group';
import ForumIcon from '@material-ui/icons/Forum';
import AlternateEmailIcon from '@material-ui/icons/AlternateEmail';
import {styles} from './Post.styles';
import { Status } from '../../types/Status';
import { Mention } from '../../types/Mention';
import { Visibility } from '../../types/Visibility';
import moment from 'moment';
import { MastodonEmoji } from '../../types/Emojis';
import AttachmentComponent from '../Attachment';
import Mastodon from 'megalodon';
import { LinkableChip, LinkableMenuItem, LinkableIconButton } from '../../interfaces/overrides';
import {withSnackbar} from 'notistack';
import ShareMenu from './PostShareMenu';

interface IPostProps {
    post: Status;
    classes: any;
    client: Mastodon;
}

interface IPostState {
    post: Status;
    media_slides?: number;
    menuIsOpen: boolean;
}

export class Post extends React.Component<any, IPostState> {

    client: Mastodon;

    constructor(props: any) {
        super(props);

        this.state = {
            post: this.props.post,
            media_slides: this.props.post.media_attachments.length > 0? this.props.post.media_attachments.length: 0,
            menuIsOpen: false
        }

        this.client = this.props.client;

    }

    togglePostMenu() {
        this.setState({ menuIsOpen: !this.state.menuIsOpen })
    }

    materializeContent(status: Status) {
        const { classes } = this.props;
        const oldContent = document.createElement('div');
        oldContent.innerHTML = status.content;
        if (status.emojis !== undefined && status.emojis.length > 0) {
            status.emojis.forEach((emoji: MastodonEmoji) => {
                let regexp = new RegExp(':' + emoji.shortcode + ':', 'g');
                oldContent.innerHTML = oldContent.innerHTML.replace(regexp, `<img src="${emoji.static_url}" class="${classes.postEmoji}"/>`)
            })
        }
        return (
            <div className={classes.mediaContainer}>
                <Typography paragraph dangerouslySetInnerHTML={{__html: oldContent.innerHTML}}/>
                {
                    status.card?
                    <div className={classes.postCard}>
                        <Divider/>
                        <CardActionArea href={status.card.url} target="_blank" rel="noreferrer">
                            <CardContent>
                                <Typography gutterBottom variant="h6" component="h2">{status.card.title}</Typography>
                                <Typography>{status.card.description}</Typography>
                            </CardContent>
                            {
                                status.card.image?
                                <CardMedia className={classes.postMedia} image={status.card.image}/>: <span/>
                            }
                            <CardContent>
                                <Typography>{status.card.provider_url|| status.card.author_url || status.card.author_url}</Typography>
                            </CardContent>
                        </CardActionArea>
                        <Divider/>
                    </div>:
                    <span/>
                }
                {
                    status.media_attachments.length > 0?
                    <AttachmentComponent media={status.media_attachments}/>:
                    <span/>
                }
            </div>
        );
    }

    getSensitiveContent(spoiler_text: string, content: Status) {
        const { classes } = this.props;
        const warningText = spoiler_text || "Unmarked content";
        let icon;
        if (spoiler_text.includes("NSFW") || spoiler_text.includes("Spoiler") || warningText === "Unmarked content") {
            icon = <WarningIcon className={classes.postWarningIcon}/>;
        }
        return (
            <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                    {icon}<Typography className={classes.heading}>{warningText}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.postContent}>
                    {this.materializeContent(content)}
                </ExpansionPanelDetails>
            </ExpansionPanel>
        )
    }

    getReblogOfPost(of: Status | null) {
        const { classes } = this.props;
        if (of !== null) {
            return (
                <CardContent className={classes.postContent}>
                    <LinkableChip
                        avatar={
                            <Avatar alt={of.account.acct} src={of.account.avatar_static}/>
                        }
                        className={classes.postReblogChip}
                        label={`@${of.account.username} posted:`}
                        key={of.id + "_reblog_chip_" + of.account.id}
                        to={`/profile/${of.account.id}`}
                        replace={true}
                        clickable
                    />
                    {of.sensitive? this.getSensitiveContent(of.spoiler_text, of): this.materializeContent(of)}
                </CardContent>
            );
        } else {
            return null;
        }
    }

    getMentions(mention: [Mention]) {
        if (mention.length > 0) {
            return (
                <CardContent>
                    <Typography variant="caption">Mentions</Typography>
                    {
                        this.state.post.mentions.map((person: Mention) => {
                            return <LinkableChip
                                        avatar={
                                            <Avatar>
                                                <AlternateEmailIcon/>
                                            </Avatar>
                                        }
                                        label={person.username}
                                        key={this.state.post.id + "_mention_" + person.id}
                                        to={`/profile/${person.id}`}
                                        clickable
                                    />
                        })
                    }
                </CardContent>
            )
        } else {
            return null;
        }
    }

    showVisibilityIcon(visibility: Visibility) {
        const { classes } = this.props;
        switch(visibility) {
            case "public":
                return <PublicIcon className={classes.postTypeIcon}/>;
            case "private":
                return <GroupIcon className={classes.postTypeIcon}/>;
            case "unlisted":
                return <VisibilityOffIcon className={classes.postTypeIcon}/>
        }
    }

    getMastodonUrl(post: Status) {
        let url = "";
        if (post.reblog) {
            url = post.reblog.uri
        } else {
            url = post.uri
        }
        return url;
    }
    
    toggleFavorited(post: Status) {
        let _this = this;
        if (post.favourited) {
            this.client.post(`/statuses/${post.id}/unfavourite`).then((resp: any) => {
                let post: Status = resp.data;
                this.setState({ post });
            }).catch((err: Error) => {
                _this.props.enqueueSnackbar(`Couldn't unfavorite post: ${err.name}`, {
                    variant: 'error'
                })
                console.log(err.message);
            })
        } else {
            this.client.post(`/statuses/${post.id}/favourite`).then((resp: any) => {
                let post: Status = resp.data;
                this.setState({ post });
            }).catch((err: Error) => {
                _this.props.enqueueSnackbar(`Couldn't favorite post: ${err.name}`, {
                    variant: 'error'
                })
                console.log(err.message);
            })
        }
    }

    toggleReblogged(post: Status) {
        if (post.reblogged) {
            this.client.post(`/statuses/${post.id}/unreblog`).then((resp: any) => {
                let post = this.state.post;
                post.reblogged = false;
                this.setState({ post });
            }).catch((err: Error) => {
                this.props.enqueueSnackbar(`Couldn't unboost post: ${err.name}`, {
                    variant: 'error'
                })
                console.log(err.message);
            })
        } else {
            this.client.post(`/statuses/${post.id}/reblog`).then((resp: any) => {
                let post = this.state.post;
                post.reblogged = true;
                this.setState({ post });
            }).catch((err: Error) => {
                this.props.enqueueSnackbar(`Couldn't boost post: ${err.name}`, {
                    variant: 'error'
                })
                console.log(err.message);
            })
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <Zoom in={true}>
            <Card className={classes.post}>
                <CardHeader avatar={<Avatar src={this.state.post.account.avatar_static} />} action={
                <IconButton key={`${this.state.post.id}_submenu`} id={`${this.state.post.id}_submenu`} onClick={() => this.togglePostMenu()}>
                    <MoreVertIcon />
                </IconButton>} 
                title={
                    `${this.state.post.account.display_name || this.state.post.account.username} (@${this.state.post.account.acct})`
                } subheader={moment(this.state.post.created_at).format("MMMM Do YYYY [at] h:mm A")} />
                    {
                        this.state.post.reblog? this.getReblogOfPost(this.state.post.reblog): null
                    }
                    {
                        this.state.post.sensitive? this.getSensitiveContent(this.state.post.spoiler_text, this.state.post):
                        <CardContent className={classes.postContent}>
                            {this.state.post.reblog? null: this.materializeContent(this.state.post)}
                        </CardContent>
                    }
                    {
                        this.getMentions(this.state.post.mentions)
                    }
                    {
                        this.state.post.reblog && this.state.post.reblog.mentions.length > 0? this.getMentions(this.state.post.reblog.mentions): <span/>
                    }
                <CardActions>
                    <Tooltip title="Reply">
                        <LinkableIconButton to={`/compose?reply=${this.state.post.id}`}>
                            <ReplyIcon/>
                        </LinkableIconButton>
                    </Tooltip>
                        <Typography>{this.state.post.replies_count}</Typography>
                    <Tooltip title="Favorite">
                        <IconButton onClick={() => this.toggleFavorited(this.state.post)}>
                            <FavoriteIcon className={this.state.post.favourited? classes.postDidAction: ''}/>
                        </IconButton>
                    </Tooltip>
                        <Typography>{this.state.post.favourites_count}</Typography>
                    <Tooltip title="Boost">
                        <IconButton onClick={() => this.toggleReblogged(this.state.post)}>
                            <AutorenewIcon className={this.state.post.reblogged? classes.postDidAction: ''}/>
                        </IconButton>
                    </Tooltip>
                        <Typography>{this.state.post.reblogs_count}</Typography>
                    <Tooltip title="View thread">
                        <LinkableIconButton to={`/conversation/${this.state.post.id}`}>
                            <ForumIcon />
                        </LinkableIconButton>
                    </Tooltip>
                    <Tooltip title="Open in Web">
                        <IconButton href={this.getMastodonUrl(this.state.post)} rel="noreferrer" target="_blank">
                            <OpenInNewIcon />
                        </IconButton>
                    </Tooltip>
                    <div className={classes.postFlexGrow} />
                    <div className={classes.postTypeIconDiv}>
                        {this.showVisibilityIcon(this.state.post.visibility)}
                    </div>
                </CardActions>
                <Menu
                    id="postmenu"
                    anchorEl={document.getElementById(`${this.state.post.id}_submenu`)}
                    open={this.state.menuIsOpen}
                    onClose={() => this.togglePostMenu()}
                >
                    <ShareMenu config={{
                        params: {
                            title: `@${this.state.post.account.username} posted on Mastodon: `,
                            text: this.state.post.content,
                            url: this.getMastodonUrl(this.state.post),
                        },
                        onShareSuccess: () => this.props.enqueueSnackbar("Post shared!", {variant: 'success'}),
                        onShareError: (error: Error) => {
                            if (error.name != "AbortError")
                                this.props.enqueueSnackbar(`Couldn't share post: ${error.name}`, {variant: 'error'})
                        },
                    }}/>
                    <LinkableMenuItem to={`/profile/${this.state.post.account.id}`}>View author profile</LinkableMenuItem>
                    {
                        this.state.post.account.id == JSON.parse(localStorage.getItem('account') as string).id?
                        <div>
                            <Divider/>
                            <MenuItem>Delete</MenuItem>
                        </div>:
                        null
                    }
                </Menu>
            </Card>
        </Zoom>
        );
    }
}

export default withStyles(styles)(withSnackbar(Post));
