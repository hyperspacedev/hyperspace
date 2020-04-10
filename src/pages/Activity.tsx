import React, { Component } from "react";
import {
    withStyles,
    Typography,
    CircularProgress,
    ListSubheader,
    Link,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    ListItemSecondaryAction,
    Tooltip,
    IconButton
} from "@material-ui/core";
import { styles } from "./PageLayout.styles";
import { UAccount, Account } from "../types/Account";
import { Tag } from "../types/Tag";
import Mastodon from "megalodon";
import { LinkableAvatar, LinkableIconButton } from "../interfaces/overrides";
import moment from "moment";

import FireplaceIcon from "@material-ui/icons/Fireplace";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import SearchIcon from "@material-ui/icons/Search";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import AssignmentIndIcon from "@material-ui/icons/AssignmentInd";

interface IActivityPageState {
    user?: UAccount;
    trendingTags?: [Tag];
    activeProfileDirectory?: [Account];
    newProfileDirectory?: [Account];
    viewLoading: boolean;
    viewLoaded?: boolean;
    viewErrored?: boolean;
}

class ActivityPage extends Component<any, IActivityPageState> {
    client: Mastodon;

    constructor(props: any) {
        super(props);

        this.client = new Mastodon(
            localStorage.getItem("access_token") as string,
            localStorage.getItem("baseurl") + "/api/v1"
        );

        this.state = {
            viewLoading: true
        };
    }

    componentDidMount() {
        this.getAccountData();

        this.client
            .get("/trends", { limit: 3 })
            .then((resp: any) => {
                let trendingTags: [Tag] = resp.data;
                this.setState({ trendingTags });
            })
            .catch((err: Error) => {
                this.setState({
                    viewLoading: false,
                    viewErrored: true
                });
                console.error(err.message);
            });

        this.client
            .get("/directory", { local: true, order: "active", limit: 5 })
            .then((resp: any) => {
                let profileDirectory: [Account] = resp.data;
                this.setState({
                    activeProfileDirectory: profileDirectory
                });
            })
            .catch((err: Error) => {
                this.setState({
                    viewLoading: false,
                    viewErrored: true
                });
                console.error(err.message);
            });

        this.client
            .get("/directory", { local: true, order: "new", limit: 5 })
            .then((resp: any) => {
                let profileDirectory: [Account] = resp.data;
                this.setState({
                    newProfileDirectory: profileDirectory,
                    viewLoading: false,
                    viewLoaded: true
                });
            })
            .catch((err: Error) => {
                this.setState({
                    viewLoading: false,
                    viewErrored: true
                });
                console.error(err.message);
            });
    }

    getAccountData() {
        this.client
            .get("/accounts/verify_credentials")
            .then((resp: any) => {
                let data: UAccount = resp.data;
                this.setState({ user: data });
            })
            .catch((err: Error) => {
                this.props.enqueueSnackbar(
                    "Couldn't find profile info: " + err.name
                );
                console.error(err.message);
                let acct = localStorage.getItem("account") as string;
                this.setState({ user: JSON.parse(acct) });
            });
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.pageLayoutConstraints}>
                <div
                    style={{
                        textAlign: "center"
                    }}
                >
                    <FireplaceIcon style={{ fontSize: 64 }} color="action" />
                    <Typography variant="h6">
                        Hey there,{" "}
                        {this.state.user
                            ? this.state.user.display_name ||
                              this.state.user.acct
                            : "user"}
                        !
                    </Typography>
                    <Typography paragraph>
                        Take a look at what's been happening on your instance.
                    </Typography>
                </div>
                {this.state.viewLoaded ? (
                    <div>
                        <ListSubheader>Trending hashtags</ListSubheader>
                        {this.state.trendingTags &&
                        this.state.trendingTags.length > 0 ? (
                            <Paper>
                                <List className={classes.pageListConstraints}>
                                    {this.state.trendingTags.map((tag: Tag) => (
                                        <ListItem
                                            id={"trending_tag_" + tag.name}
                                            key={"trending_tag_" + tag.name}
                                        >
                                            <ListItemAvatar>
                                                <TrendingUpIcon />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={"#" + tag.name}
                                                secondary={
                                                    tag.history
                                                        ? `${tag.history[0].accounts} people talking in ${tag.history[0].uses} posts`
                                                        : "Couldn't determine usage"
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Tooltip title="Search">
                                                    <LinkableIconButton
                                                        to={`/search?query=tag:${tag.name}`}
                                                    >
                                                        <SearchIcon />
                                                    </LinkableIconButton>
                                                </Tooltip>
                                                <Tooltip title="View on web">
                                                    <IconButton>
                                                        <OpenInNewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        ) : (
                            <Typography paragraph>
                                It looks like there aren't any trending tags on
                                your instance as of right now.
                            </Typography>
                        )}
                        <br />
                        <ListSubheader>Who's been active</ListSubheader>
                        {this.state.activeProfileDirectory &&
                        this.state.activeProfileDirectory.length > 0 ? (
                            <Paper>
                                <List className={classes.pageListConstraints}>
                                    {this.state.activeProfileDirectory.map(
                                        (account: Account) => (
                                            <ListItem
                                                key={
                                                    "account_active_" +
                                                    account.acct
                                                }
                                                id={
                                                    "account_active_" +
                                                    account.acct
                                                }
                                            >
                                                <ListItemAvatar>
                                                    <LinkableAvatar
                                                        to={`/profile/${account.id}`}
                                                        src={
                                                            account.avatar_static
                                                        }
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        `${account.display_name} (@${account.username})` ||
                                                        `@${account.username}`
                                                    }
                                                    secondary={`Last posted ${moment(
                                                        account.last_status_at
                                                    )
                                                        .startOf("minute")
                                                        .fromNow()}`}
                                                />
                                                <ListItemSecondaryAction>
                                                    <Tooltip title="View account">
                                                        <LinkableIconButton
                                                            to={`/profile/${account.id}`}
                                                        >
                                                            <AssignmentIndIcon />
                                                        </LinkableIconButton>
                                                    </Tooltip>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        )
                                    )}
                                </List>
                            </Paper>
                        ) : (
                            <Typography paragraph>
                                It looks like there aren't any active people in
                                the profile directory yet.
                            </Typography>
                        )}
                        <br />
                        <ListSubheader>New arrivals</ListSubheader>
                        {this.state.newProfileDirectory &&
                        this.state.newProfileDirectory.length > 0 ? (
                            <Paper>
                                <List className={classes.pageListConstraints}>
                                    {this.state.newProfileDirectory.map(
                                        (account: Account) => (
                                            <ListItem
                                                key={
                                                    "account_new_" +
                                                    account.acct
                                                }
                                                id={
                                                    "account_new_" +
                                                    account.acct
                                                }
                                            >
                                                <ListItemAvatar>
                                                    <LinkableAvatar
                                                        to={`/profile/${account.id}`}
                                                        src={
                                                            account.avatar_static
                                                        }
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        `${account.display_name} (@${account.username})` ||
                                                        `@${account.username}`
                                                    }
                                                    secondary={`Joined ${moment(
                                                        account.created_at
                                                    )
                                                        .startOf("minute")
                                                        .fromNow()}`}
                                                />
                                                <ListItemSecondaryAction>
                                                    <Tooltip title="View account">
                                                        <LinkableIconButton
                                                            to={`/profile/${account.id}`}
                                                        >
                                                            <AssignmentIndIcon />
                                                        </LinkableIconButton>
                                                    </Tooltip>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        )
                                    )}
                                </List>
                            </Paper>
                        ) : (
                            <Typography paragraph>
                                It looks like there aren't any new arrivals
                                listed in the profile directory yet.
                            </Typography>
                        )}
                    </div>
                ) : null}
                {this.state.viewErrored ? (
                    <Paper className={classes.errorCard}>
                        <Typography variant="h4">Bummer.</Typography>
                        <Typography variant="h6">
                            Something went wrong when loading instance activity.
                        </Typography>
                    </Paper>
                ) : (
                    <span />
                )}
                {this.state.viewLoading ? (
                    <div style={{ textAlign: "center" }}>
                        <CircularProgress
                            className={classes.progress}
                            color="primary"
                        />
                    </div>
                ) : (
                    <span />
                )}
                <br />
                <div>
                    <Typography variant="caption">
                        Trending hashtags and the profile directory may not
                        appear here if your instance isn't up to date. Check the{" "}
                        <Link href="/#/about">about page</Link> to see if your
                        instance is running the latest version.
                    </Typography>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(ActivityPage);
