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
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import {styles} from './Post.styles';
import { Status } from '../../types/Status';
import { Tag } from '../../types/Tag';
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

        let anchors = oldContent.getElementsByTagName("a");

        Array.prototype.forEach.call(anchors, (link: HTMLAnchorElement) => {
            if (link.className.includes("mention") || link.className.includes("hashtag")) {
                link.removeAttribute("href");
            }
        });

        if (status.emojis !== undefined && status.emojis.length > 0) {
            status.emojis.forEach((emoji: MastodonEmoji) => {
                let regexp = new RegExp(':' + emoji.shortcode + ':', 'g');
                oldContent.innerHTML = oldContent.innerHTML.replace(regexp, `<img src="${emoji.static_url}" class="${classes.postEmoji}"/>`)
            })
        }
        return (
            <CardContent className={classes.postContent}>
                <div className={classes.mediaContainer}>
                    <Typography paragraph dangerouslySetInnerHTML={{__html: oldContent.innerHTML}}/>
                    {
                        status.card?
                        <div className={classes.postCard}>
                            <Divider/>
                            <CardActionArea href={status.card.url} target="_blank" rel="noreferrer">
                                <CardContent>
                                    <Typography gutterBottom variant="h6" component="h2">{status.card.title}</Typography>
                                    <Typography>{status.card.description || "No description provided. Click with caution."}</Typography>
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
            </CardContent>
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
            <ExpansionPanel className={spoiler_text.includes("NSFW")? classes.nsfwCard: classes.spoilerCard} color="inherit">
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>} color="inherit">
                    {icon}<Typography className={classes.heading} color="inherit">{warningText}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.postContent} color="inherit">
                    {this.materializeContent(content)}
                </ExpansionPanelDetails>
            </ExpansionPanel>
        )
    }

    getReblogOfPost(of: Status | null) {
        const { classes } = this.props;
        if (of !== null) {
            return (
                of.sensitive? this.getSensitiveContent(of.spoiler_text, of): this.materializeContent(of)
            );
        } else {
            return null;
        }
    }

    getReblogAuthors(post: Status) {
        if (post.reblog) {
            let author = post.reblog.account;
            return `${author.display_name || author.username} (@${author.acct}) 🔄 ${post.account.display_name || post.account.username}`
        } else {
            let author = post.account;
            return `${author.display_name || author.username} (@${author.acct})`
        }

    }

    getMentions(mention: [Mention]) {
        const { classes } = this.props;
        if (mention.length > 0) {
            return (
                <CardContent>
                    <Typography variant="caption">Mentions</Typography>
                    {
                        mention.map((person: Mention) => {
                            return <LinkableChip
                                        avatar={
                                            <Avatar>
                                                <AlternateEmailIcon/>
                                            </Avatar>
                                        }
                                        label={person.username}
                                        key={this.state.post.id + "_mention_" + person.id}
                                        to={`/profile/${person.id}`}
                                        className={classes.postMention}
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

    getTags(tags: [Tag]) {
        const { classes } = this.props;
        if (tags.length > 0) {
            return (
                <CardContent>
                    <Typography variant="caption">Tags</Typography>
                    {
                        tags.map((tag: Tag) => {
                            return <LinkableChip
                                        avatar={
                                            <Avatar>
                                                <LocalOfferIcon/>
                                            </Avatar>
                                        }
                                        label={tag.name}
                                        key={this.state.post.id + "_tag_" + tag.name}
                                        to={`/search?query=${tag.name}&type=tag`}
                                        className={classes.postMention}
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
        const post = this.state.post;
        return (
            <Zoom in={true}>
            <Card className={classes.post}>
                <CardHeader avatar={
                    <Avatar src={
                        post.reblog? post.reblog.account.avatar_static: post.account.avatar_static
                    } />
                } action={
                <IconButton key={`${post.id}_submenu`} id={`${post.id}_submenu`} onClick={() => this.togglePostMenu()}>
                    <MoreVertIcon />
                </IconButton>} 
                title={this.getReblogAuthors(post)} subheader={moment(post.created_at).format("MMMM Do YYYY [at] h:mm A")} />
                    {
                        post.reblog? this.getReblogOfPost(post.reblog): null
                    }
                    {
                        post.sensitive? this.getSensitiveContent(post.spoiler_text, post):
                            post.reblog? null: this.materializeContent(post)
                    }
                    {
                        post.reblog && post.reblog.mentions.length > 0? this.getMentions(post.reblog.mentions): this.getMentions(post.mentions)
                    }
                    {
                        post.reblog && post.reblog.tags.length > 0? this.getTags(post.reblog.tags): this.getTags(post.tags)
                    }
                <CardActions>
                    <Tooltip title="Reply">
                        <LinkableIconButton to={`/compose?reply=${post.id}`}>
                            <ReplyIcon/>
                        </LinkableIconButton>
                    </Tooltip>
                        <Typography>{post.reblog? post.reblog.replies_count: post.replies_count}</Typography>
                    <Tooltip title="Favorite">
                        <IconButton onClick={() => this.toggleFavorited(post)}>
                            <FavoriteIcon className={
                                post.reblog? 
                                    post.reblog.favourited? 
                                        classes.postDidAction: 
                                        '': 
                                    post.favourited? 
                                        classes.postDidAction: 
                                        ''
                            }/>
                        </IconButton>
                    </Tooltip>
                        <Typography>{post.reblog? post.reblog.favourites_count: post.favourites_count}</Typography>
                    <Tooltip title="Boost">
                        <IconButton onClick={() => this.toggleReblogged(post)}>
                            <AutorenewIcon className={
                                post.reblog? 
                                    post.reblog.reblogged? 
                                        classes.postDidAction: 
                                        '': 
                                    post.reblogged? 
                                        classes.postDidAction: 
                                        ''
                            }/>
                        </IconButton>
                    </Tooltip>
                        <Typography>{post.reblog? post.reblog.reblogs_count: post.reblogs_count}</Typography>
                    <Tooltip title="View thread">
                        <LinkableIconButton to={`/conversation/${post.id}`}>
                            <ForumIcon />
                        </LinkableIconButton>
                    </Tooltip>
                    <Tooltip title="Open in Web">
                        <IconButton href={this.getMastodonUrl(post)} rel="noreferrer" target="_blank">
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
                    <ShareMenu config={{
                        params: {
                            title: `@${post.account.username} posted on Mastodon: `,
                            text: post.content,
                            url: this.getMastodonUrl(post),
                        },
                        onShareSuccess: () => this.props.enqueueSnackbar("Post shared!", {variant: 'success'}),
                        onShareError: (error: Error) => {
                            if (error.name != "AbortError")
                                this.props.enqueueSnackbar(`Couldn't share post: ${error.name}`, {variant: 'error'})
                        },
                    }}/>
                    {
                        post.reblog?
                        <div>
                            <LinkableMenuItem to={`/profile/${post.reblog.account.id}`}>View author profile</LinkableMenuItem>
                            <LinkableMenuItem to={`/profile/${post.account.id}`}>View reblogger profile</LinkableMenuItem>

                        </div>: <LinkableMenuItem to={`/profile/${post.account.id}`}>View profile</LinkableMenuItem>
                    }
                    {
                        post.account.id == JSON.parse(localStorage.getItem('account') as string).id?
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
