import React, { Component } from "react";
import {
    withStyles,
    Typography,
    Avatar,
    Button,
    CircularProgress,
    Paper,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Toolbar,
    IconButton
} from "@material-ui/core";
import { styles } from "./PageLayout.styles";
import Mastodon from "megalodon";
import { Account } from "../types/Account";
import { Status } from "../types/Status";
import { Relationship } from "../types/Relationship";
import Post from "../components/Post";
import { withSnackbar } from "notistack";
import { LinkableIconButton } from "../interfaces/overrides";
import { emojifyString } from "../utilities/emojis";
import Masonry from "react-masonry-css";
import { getUserDefaultBool } from "..//utilities/settings";

import AccountEditIcon from "mdi-material-ui/AccountEdit";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import PersonAddDisabledIcon from "@material-ui/icons/PersonAddDisabled";
import AccountMinusIcon from "mdi-material-ui/AccountMinus";
import ChatIcon from "@material-ui/icons/Chat";
import AccountRemoveIcon from "mdi-material-ui/AccountRemove";
import AccountHeartIcon from "mdi-material-ui/AccountHeart";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

interface IProfilePageState {
    account?: Account;
    relationship?: Relationship;
    posts?: [Status];
    viewIsLoading: boolean;
    viewDidLoad?: boolean;
    viewDidError?: boolean;
    viewDidErrorCode?: string;
    blockDialogOpen: boolean;
    isMasonryLayout?: boolean;
}

class ProfilePage extends Component<any, IProfilePageState> {
    client: Mastodon;

    constructor(props: any) {
        super(props);

        this.client = new Mastodon(
            localStorage.getItem("access_token") as string,
            localStorage.getItem("baseurl") + "/api/v1"
        );

        this.state = {
            viewIsLoading: true,
            blockDialogOpen: false,
            isMasonryLayout: getUserDefaultBool("isMasonryLayout")
        };
    }

    toggleBlockDialog() {
        if (this.state.relationship && !this.state.relationship.blocking)
            this.setState({ blockDialogOpen: !this.state.blockDialogOpen });
        else this.toggleBlock();
    }

    getAccountData(id: string) {
        this.client
            .get(`/accounts/${id}`)
            .then((resp: any) => {
                let profile: Account = resp.data;

                const div = document.createElement("div");
                div.innerHTML = profile.note;
                profile.note = div.textContent || div.innerText || "";

                this.setState({
                    account: profile
                });
            })
            .catch((error: Error) => {
                this.setState({
                    viewIsLoading: false,
                    viewDidError: true,
                    viewDidErrorCode: error.message
                });
            });
        this.getRelationships();
        this.client
            .get(`/accounts/${id}/statuses`)
            .then((resp: any) => {
                this.setState({
                    posts: resp.data,
                    viewIsLoading: false,
                    viewDidLoad: true,
                    viewDidError: false
                });
            })
            .catch((err: Error) => {
                this.setState({
                    viewIsLoading: false,
                    viewDidError: true,
                    viewDidErrorCode: err.message
                });
            });
    }

    componentWillReceiveProps(props: any) {
        this.getAccountData(props.match.params.profileId);
        window.scrollTo(0, 0);
    }

    componentWillMount() {
        const {
            match: { params }
        } = this.props;
        this.getAccountData(params.profileId);
    }

    isItMe(): boolean {
        if (this.state.account) {
            return (
                this.state.account.id ===
                JSON.parse(localStorage.getItem("account") as string).id
            );
        } else {
            return false;
        }
    }

    getRelationships() {
        this.client
            .get("/accounts/relationships", {
                id: this.props.match.params.profileId
            })
            .then((resp: any) => {
                let relationship: Relationship = resp.data[0];
                this.setState({ relationship });
            })
            .catch((error: Error) => {
                this.setState({
                    viewIsLoading: false,
                    viewDidError: true,
                    viewDidErrorCode: error.message
                });
            });
    }

    loadMoreTimelinePieces() {
        const {
            match: { params }
        } = this.props;
        this.setState({ viewDidLoad: false, viewIsLoading: true });
        if (this.state.posts && this.state.posts.length > 0) {
            this.client
                .get(`/accounts/${params.profileId}/statuses`, {
                    max_id: this.state.posts[this.state.posts.length - 1].id,
                    limit: 20
                })
                .then((resp: any) => {
                    let newPosts: [Status] = resp.data;
                    let posts = this.state.posts as [Status];
                    if (newPosts.length <= 0) {
                        this.props.enqueueSnackbar("Reached end of posts", {
                            variant: "error"
                        });
                    } else {
                        newPosts.forEach((post: Status) => {
                            posts.push(post);
                        });
                    }
                    this.setState({
                        viewIsLoading: false,
                        viewDidLoad: true,
                        posts
                    });
                })
                .catch((err: Error) => {
                    this.setState({
                        viewIsLoading: false,
                        viewDidError: true,
                        viewDidErrorCode: err.message
                    });
                    this.props.enqueueSnackbar("Failed to get posts", {
                        variant: "error"
                    });
                });
        } else {
            this.props.enqueueSnackbar("Reached end of posts", {
                variant: "error"
            });
            this.setState({
                viewIsLoading: false,
                viewDidLoad: true
            });
        }
    }

    toggleFollow() {
        if (this.state.relationship) {
            if (this.state.relationship.following) {
                this.client
                    .post(
                        `/accounts/${
                            this.state.account
                                ? this.state.account.id
                                : this.props.match.params.profileId
                        }/unfollow`
                    )
                    .then((resp: any) => {
                        let relationship: Relationship = resp.data;
                        this.setState({ relationship });
                        this.props.enqueueSnackbar(
                            "You are no longer following this account."
                        );
                    })
                    .catch((err: Error) => {
                        this.props.enqueueSnackbar(
                            "Couldn't unfollow account: " + err.name,
                            { variant: "error" }
                        );
                        console.error(err.message);
                    });
            } else {
                this.client
                    .post(
                        `/accounts/${
                            this.state.account
                                ? this.state.account.id
                                : this.props.match.params.profileId
                        }/follow`
                    )
                    .then((resp: any) => {
                        let relationship: Relationship = resp.data;
                        this.setState({ relationship });
                        this.props.enqueueSnackbar(
                            "You are now following this account."
                        );
                    })
                    .catch((err: Error) => {
                        this.props.enqueueSnackbar(
                            "Couldn't follow account: " + err.name,
                            { variant: "error" }
                        );
                        console.error(err.message);
                    });
            }
        }
    }

    toggleBlock() {
        if (this.state.relationship) {
            if (this.state.relationship.blocking) {
                this.client
                    .post(
                        `/accounts/${
                            this.state.account
                                ? this.state.account.id
                                : this.props.match.params.profileId
                        }/unblock`
                    )
                    .then((resp: any) => {
                        let relationship: Relationship = resp.data;
                        this.setState({ relationship });
                        this.props.enqueueSnackbar(
                            "You are no longer blocking this account."
                        );
                    })
                    .catch((err: Error) => {
                        this.props.enqueueSnackbar(
                            "Couldn't unblock account: " + err.name,
                            { variant: "error" }
                        );
                        console.error(err.message);
                    });
            } else {
                this.client
                    .post(
                        `/accounts/${
                            this.state.account
                                ? this.state.account.id
                                : this.props.match.params.profileId
                        }/block`
                    )
                    .then((resp: any) => {
                        let relationship: Relationship = resp.data;
                        this.setState({ relationship });
                        this.props.enqueueSnackbar(
                            "You are now blocking this account."
                        );
                    })
                    .catch((err: Error) => {
                        this.props.enqueueSnackbar(
                            "Couldn't block account: " + err.name,
                            { variant: "error" }
                        );
                        console.error(err.message);
                    });
            }
        }
    }

    renderPosts(posts: Status[]) {
        const { classes } = this.props;
        const postComponents = posts.map((post: Status) => {
            return <Post key={post.id} post={post} client={this.client} />;
        });
        if (this.state.isMasonryLayout) {
            return (
                <Masonry
                    className={classes.masonryGrid}
                    columnClassName={classes["my-masonry-grid_column"]}
                    breakpointCols={{
                        default: 4,
                        2000: 3,
                        1400: 2,
                        1050: 1
                    }}
                >
                    {postComponents}
                </Masonry>
            );
        } else {
            return <div>{postComponents}</div>;
        }
    }

    render() {
        const { classes } = this.props;
        const containerClasses = `${classes.pageContentLayoutConstraints} ${
            this.state.isMasonryLayout ? classes.pageLayoutMasonry : ""
        }`;
        return (
            <div className={classes.pageLayoutMinimalConstraints}>
                <div className={classes.pageHeroBackground}>
                    <div
                        className={classes.pageHeroBackgroundImage}
                        style={{
                            backgroundImage: this.state.account
                                ? `url("${this.state.account.header}")`
                                : `url("")`
                        }}
                    />
                    <Toolbar className={classes.profileToolbar}>
                        <div className={classes.pageGrow} />
                        <Tooltip
                            title={
                                this.isItMe()
                                    ? "You can't follow yourself."
                                    : this.state.relationship &&
                                      this.state.relationship.following
                                    ? "Unfollow"
                                    : "Follow"
                            }
                        >
                            <IconButton
                                color={"inherit"}
                                disabled={this.isItMe()}
                                onClick={() => this.toggleFollow()}
                            >
                                {this.isItMe() ? (
                                    <PersonAddDisabledIcon />
                                ) : this.state.relationship &&
                                  this.state.relationship.following ? (
                                    <AccountMinusIcon />
                                ) : (
                                    <PersonAddIcon />
                                )}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={"Send a message or post"}>
                            <LinkableIconButton
                                to={`/compose?acct=${
                                    this.state.account
                                        ? this.state.account.acct
                                        : ""
                                }`}
                                color={"inherit"}
                            >
                                <ChatIcon />
                            </LinkableIconButton>
                        </Tooltip>
                        <Tooltip
                            title={
                                this.state.relationship &&
                                this.state.relationship.blocking
                                    ? "Unblock this account"
                                    : "Block this account"
                            }
                        >
                            <IconButton
                                color={"inherit"}
                                disabled={this.isItMe()}
                                onClick={() => this.toggleBlockDialog()}
                            >
                                {this.state.relationship &&
                                this.state.relationship.blocking ? (
                                    <AccountHeartIcon />
                                ) : (
                                    <AccountRemoveIcon />
                                )}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Open in web">
                            <IconButton
                                href={
                                    this.state.account
                                        ? this.state.account.url
                                        : ""
                                }
                                target="_blank"
                                rel={"nofollower noreferrer noopener"}
                                color={"inherit"}
                            >
                                <OpenInNewIcon />
                            </IconButton>
                        </Tooltip>
                        {this.isItMe() ? (
                            <Tooltip title="Edit profile">
                                <LinkableIconButton to="/you" color="inherit">
                                    <AccountEditIcon />
                                </LinkableIconButton>
                            </Tooltip>
                        ) : null}
                    </Toolbar>
                    <div className={classes.profileContent}>
                        <Avatar
                            className={classes.profileAvatar}
                            src={
                                this.state.account
                                    ? this.state.account.avatar
                                    : ""
                            }
                        />
                        <div className={classes.profileUserBox}>
                            <Typography
                                variant="h4"
                                color="inherit"
                                dangerouslySetInnerHTML={{
                                    __html: this.state.account
                                        ? this.state.account.display_name
                                            ? emojifyString(
                                                  this.state.account
                                                      .display_name,
                                                  this.state.account.emojis,
                                                  classes.pageProfileNameEmoji
                                              )
                                            : this.state.account.username
                                        : ""
                                }}
                                className={classes.pageProfileNameEmoji}
                            />
                            <Typography variant="caption" color="inherit">
                                {this.state.account
                                    ? "@" + this.state.account.acct
                                    : ""}
                            </Typography>
                            <Typography
                                paragraph
                                color="inherit"
                                dangerouslySetInnerHTML={{
                                    __html: this.state.account
                                        ? this.state.account.note
                                            ? emojifyString(
                                                  this.state.account.note,
                                                  this.state.account.emojis,
                                                  classes.pageProfileBioEmoji
                                              )
                                            : "No bio provided by user."
                                        : "No bio available."
                                }}
                            ></Typography>
                            <Typography color={"inherit"}>
                                {this.state.account
                                    ? this.state.account.followers_count
                                    : 0}{" "}
                                followers |{" "}
                                {this.state.account
                                    ? this.state.account.following_count
                                    : 0}{" "}
                                following |{" "}
                                {this.state.account
                                    ? this.state.account.statuses_count
                                    : 0}{" "}
                                posts
                            </Typography>
                        </div>
                    </div>
                </div>
                <div className={containerClasses}>
                    {this.state.viewDidError ? (
                        <Paper className={classes.errorCard}>
                            <Typography variant="h4">Bummer.</Typography>
                            <Typography variant="h6">
                                Something went wrong when loading this profile.
                            </Typography>
                            <Typography>
                                {this.state.viewDidErrorCode
                                    ? this.state.viewDidErrorCode
                                    : ""}
                            </Typography>
                        </Paper>
                    ) : (
                        <span />
                    )}
                    {this.state.posts ? (
                        <div>
                            {this.renderPosts(this.state.posts)}
                            <br />
                            {this.state.viewDidLoad &&
                            !this.state.viewDidError ? (
                                <div
                                    style={{ textAlign: "center" }}
                                    onClick={() =>
                                        this.loadMoreTimelinePieces()
                                    }
                                >
                                    <Button variant="contained">
                                        Load more
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <span />
                    )}
                    {this.state.viewIsLoading ? (
                        <div style={{ textAlign: "center" }}>
                            <CircularProgress
                                className={classes.progress}
                                color="primary"
                            />
                        </div>
                    ) : (
                        <span />
                    )}
                    <Dialog
                        open={this.state.blockDialogOpen}
                        onClose={() => this.toggleBlockDialog()}
                    >
                        <DialogTitle id="alert-dialog-title">
                            Block this person?
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                Are you sure you want to block this person? You
                                won't see their posts on your home feed, local
                                timeline, or public timeline.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => this.toggleBlockDialog()}
                                color="primary"
                                autoFocus
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    this.toggleBlock();
                                    this.toggleBlockDialog();
                                }}
                                color="primary"
                            >
                                Block
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(withSnackbar(ProfilePage));
