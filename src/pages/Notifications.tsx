import React, { Component } from "react";
import {
    Link,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    ListItemSecondaryAction,
    ListItemAvatar,
    Paper,
    IconButton,
    withStyles,
    Typography,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tooltip,
    Menu,
    MenuItem
} from "@material-ui/core";

import AssignmentIndIcon from "@material-ui/icons/AssignmentInd";
import PersonIcon from "@material-ui/icons/Person";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import PersonRemoveIcon from "mdi-material-ui/AccountMinus";
import DeleteIcon from "@material-ui/icons/Delete";
import { styles } from "./PageLayout.styles";
import {
    LinkableIconButton,
    LinkableAvatar,
    LinkableMenuItem
} from "../interfaces/overrides";
import ForumIcon from "@material-ui/icons/Forum";
import ReplyIcon from "@material-ui/icons/Reply";
import NotificationsIcon from "@material-ui/icons/Notifications";
import MoreVertIcon from "@material-ui/icons/MoreVert";

import Mastodon from "megalodon";
import { Notification } from "../types/Notification";
import { Account } from "../types/Account";
import { Relationship } from "../types/Relationship";
import { withSnackbar } from "notistack";
import { Dictionary } from "../interfaces/utils";
import { linkablePath } from "../utilities/desktop";

/**
 * The state interface for the notifications page.
 */
interface INotificationsPageState {
    /**
     * The list of notifications, if it exists.
     */
    notifications?: [Notification];

    /**
     * The relationships with all notification accounts
     */
    relationships: { [id: string]: Relationship };

    /**
     * Whether the view is still loading.
     */
    viewIsLoading: boolean;

    /**
     * Whether the view has loaded.
     */
    viewDidLoad?: boolean;

    /**
     * Whether the view has loaded but in error.
     */
    viewDidError?: boolean;

    /**
     * The error code for an errored state, if possible.
     */
    viewDidErrorCode?: string;

    /**
     * Whether the delete confirmation dialog should be open.
     */
    deleteDialogOpen: boolean;

    /**
     * Whether the menu should be open on smaller devices.
     */
    mobileMenuOpen: Dictionary<boolean>;
}

/**
 * The notifications page.
 */
class NotificationsPage extends Component<any, INotificationsPageState> {
    /**
     * The Mastodon object to perform notification operations on.
     */
    client: Mastodon;

    /**
     * The stream listener for tuning in to notifications.
     */
    streamListener: any;

    /**
     * Construct the notifications page.
     * @param props The properties to pass in
     */
    constructor(props: any) {
        super(props);

        // Create the Mastodon object.
        this.client = new Mastodon(
            localStorage.getItem("access_token") as string,
            localStorage.getItem("baseurl") + "/api/v1"
        );

        // Initialize the state.
        this.state = {
            viewIsLoading: true,
            deleteDialogOpen: false,
            mobileMenuOpen: {},
            relationships: {}
        };
    }

    /**
     * Perform pre-mount tasks
     */
    async componentWillMount() {
        try {
            // Get the list of notifications
            let resp: any = await this.client.get("/notifications");
            let notifications: [Notification] = resp.data;

            // initialize all menus as closed
            let notifMenus: Dictionary<boolean> = {};
            notifications.forEach(
                (n: Notification) => (notifMenus[n.id] = false)
            );

            // compile list of all notification account ids
            let accountIds: string[] = [];
            notifications.forEach(notif => {
                if (!accountIds.includes(notif.account.id)) {
                    accountIds.push(notif.account.id);
                }
            });

            // store relationships in id-relationship pairs
            resp = await this.client.get(`/accounts/relationships`, {
                id: accountIds
            });
            let relationships: Dictionary<Relationship> = {};
            resp.data.forEach((relation: Relationship) => {
                relationships[relation.id] = relation;
            });

            this.setState({
                notifications,
                relationships,
                viewIsLoading: false,
                viewDidLoad: true,
                mobileMenuOpen: notifMenus
            });
        } catch (e) {
            this.setState({
                viewDidLoad: true,
                viewIsLoading: false,
                viewDidError: true,
                viewDidErrorCode: e.message
            });
        }
    }

    /**
     * Perform post-mount tasks.
     */
    componentDidMount() {
        // Start listening for new notifications after fetching.
        this.streamNotifications();
    }

    /**
     * Set up a stream listener and keep updating notifications.
     */
    streamNotifications() {
        this.streamListener = this.client.stream("/streaming/user");

        this.streamListener.on("notification", (notif: Notification) => {
            let notifications = this.state.notifications;
            if (notifications) {
                notifications.unshift(notif);
                this.setState({ notifications });
            }
        });
    }

    /**
     * Toggle the state of the delete dialog.
     */
    toggleDeleteDialog() {
        this.setState({ deleteDialogOpen: !this.state.deleteDialogOpen });
    }

    toggleMobileMenu(id: string) {
        let mobileMenuOpen = this.state.mobileMenuOpen;
        mobileMenuOpen[id] = !mobileMenuOpen[id];
        this.setState({ mobileMenuOpen });
    }

    /**
     * Strip HTML content from a string containing HTML content.
     *
     * @param text The sanitized HTML to strip
     * @returns A string containing the contents of the sanitized HTML
     */
    removeHTMLContent(text: string) {
        const div = document.createElement("div");
        div.innerHTML = text;
        let innerContent = div.textContent || div.innerText || "";
        if (innerContent.length > 65)
            innerContent = innerContent.slice(0, 65) + "...";
        return innerContent;
    }

    /**
     * Remove a notification from the server.
     * @param id The notification's ID
     */
    removeNotification(id: string) {
        this.client
            .post(`/notifications/${id}/dismiss`)
            .then((resp: any) => {
                let notifications = this.state.notifications;
                if (notifications !== undefined && notifications.length > 0) {
                    notifications.forEach((notification: Notification) => {
                        if (
                            notifications !== undefined &&
                            notification.id === id
                        ) {
                            notifications.splice(
                                notifications.indexOf(notification),
                                1
                            );
                        }
                    });
                }
                this.setState({ notifications });
                this.props.enqueueSnackbar("Notification deleted.");
            })
            .catch((err: Error) => {
                this.props.enqueueSnackbar(
                    "Couldn't delete notification: " + err.name,
                    {
                        variant: "error"
                    }
                );
            });
    }

    /**
     * Purge all notifications from the server.
     */
    removeAllNotifications() {
        this.client
            .post("/notifications/clear")
            .then((resp: any) => {
                this.setState({ notifications: undefined });
                this.props.enqueueSnackbar("All notifications deleted.");
            })
            .catch((err: Error) => {
                this.props.enqueueSnackbar(
                    "Couldn't delete notifications: " + err.name,
                    {
                        variant: "error"
                    }
                );
            });
    }

    /**
     * Render a single notification unit to be used in a list
     * @param notif The notification to work with.
     */
    createNotification(notif: Notification) {
        const { classes } = this.props;
        let primary = "";
        let secondary = "";
        switch (notif.type) {
            case "follow":
                primary = `${notif.account.display_name ||
                    notif.account.username} is now following you!`;
                break;
            case "mention":
                primary = `${notif.account.display_name ||
                    notif.account.username} mentioned you in a post.`;
                secondary = this.removeHTMLContent(
                    notif.status ? notif.status.content : ""
                );
                break;
            case "reblog":
                primary = `${notif.account.display_name ||
                    notif.account.username} reblogged your post.`;
                secondary = this.removeHTMLContent(
                    notif.status ? notif.status.content : ""
                );
                break;
            case "favourite":
                primary = `${notif.account.display_name ||
                    notif.account.username} favorited your post.`;
                secondary = this.removeHTMLContent(
                    notif.status ? notif.status.content : ""
                );
                break;
            default:
                if (notif.status && notif.status.poll) {
                    primary = "A poll you voted in or created has ended.";
                    secondary = this.removeHTMLContent(
                        notif.status ? notif.status.content : ""
                    );
                } else {
                    primary = "A magical thing happened!";
                }
                break;
        }
        return (
            <ListItem key={notif.id}>
                <ListItemAvatar>
                    <LinkableAvatar
                        alt={notif.account.username}
                        src={notif.account.avatar_static}
                        to={`/profile/${notif.account.id}`}
                    >
                        <PersonIcon />
                    </LinkableAvatar>
                </ListItemAvatar>
                <ListItemText
                    primary={primary}
                    secondary={
                        <span>
                            <Typography
                                color="textSecondary"
                                className={classes.mobileOnly}
                            >
                                {secondary.slice(0, 35) + "..."}
                            </Typography>
                            <Typography
                                color="textSecondary"
                                className={classes.desktopOnly}
                            >
                                {secondary}
                            </Typography>
                        </span>
                    }
                />
                <ListItemSecondaryAction>
                    {this.getActions(notif)}
                </ListItemSecondaryAction>
            </ListItem>
        );
    }

    /**
     * Un/follow an account and update relationships state.
     * @param acct The account to un/follow, if possible
     */
    async toggleFollow(acct: Account) {
        let relationships = this.state.relationships;
        if (!relationships[acct.id].following) {
            try {
                let resp: any = await this.client.post(
                    `/accounts/${acct.id}/follow`
                );
                relationships[acct.id] = resp.data;
                this.setState({ relationships });
                this.props.enqueueSnackbar(
                    "You are now following this account."
                );
            } catch (e) {
                this.props.enqueueSnackbar(
                    "Couldn't follow acccount: " + e.name
                );
                console.error(e.message);
            }
        } else {
            try {
                let resp: any = await this.client.post(
                    `/accounts/${acct.id}/unfollow`
                );
                relationships[acct.id] = resp.data;
                this.setState({ relationships });
                this.props.enqueueSnackbar(
                    "You are no longer following this account."
                );
            } catch (e) {
                this.props.enqueueSnackbar(
                    "Couldn't unfollow acccount: " + e.name
                );
                console.error(e.message);
            }
        }
    }

    getActions = (notif: Notification) => {
        const { classes } = this.props;
        return (
            <>
                <IconButton
                    onClick={() => this.toggleMobileMenu(notif.id)}
                    className={classes.mobileOnly}
                    id={`notification-list-${notif.id}`}
                >
                    <MoreVertIcon />
                </IconButton>
                <Menu
                    open={this.state.mobileMenuOpen[notif.id]}
                    anchorEl={document.getElementById(
                        `notification-list-${notif.id}`
                    )}
                    onClose={() => this.toggleMobileMenu(notif.id)}
                >
                    {notif.type === "follow" ? (
                        <>
                            <LinkableMenuItem
                                to={`profile/${notif.account.id}`}
                            >
                                View Profile
                            </LinkableMenuItem>
                            <MenuItem
                                onClick={() => this.toggleFollow(notif.account)}
                            >
                                {this.state.relationships[notif.account.id]
                                    .following
                                    ? "Unfollow"
                                    : "Follow"}
                            </MenuItem>
                        </>
                    ) : null}
                    {notif.type === "mention" && notif.status ? (
                        <LinkableMenuItem
                            to={`/compose?reply=${
                                notif.status.reblog
                                    ? notif.status.reblog.id
                                    : notif.status.id
                            }&visibility=${notif.status.visibility}&acct=${
                                notif.status.reblog
                                    ? notif.status.reblog.account.acct
                                    : notif.status.account.acct
                            }`}
                        >
                            Reply
                        </LinkableMenuItem>
                    ) : null}
                    <MenuItem onClick={() => this.removeNotification(notif.id)}>
                        Remove
                    </MenuItem>
                </Menu>
                <div className={classes.desktopOnly}>
                    {notif.type === "follow" ? (
                        <span>
                            <Tooltip title="View profile">
                                <LinkableIconButton
                                    to={`/profile/${notif.account.id}`}
                                >
                                    <AssignmentIndIcon />
                                </LinkableIconButton>
                            </Tooltip>
                            {!this.state.relationships[notif.account.id]
                                .following ? (
                                <Tooltip title="Follow account">
                                    <IconButton
                                        onClick={() =>
                                            this.toggleFollow(notif.account)
                                        }
                                    >
                                        <PersonAddIcon />
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Tooltip title="Unfollow account">
                                    <IconButton
                                        onClick={() =>
                                            this.toggleFollow(notif.account)
                                        }
                                    >
                                        <PersonRemoveIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </span>
                    ) : notif.status ? (
                        <span>
                            <Tooltip title="View conversation">
                                <LinkableIconButton
                                    to={`/conversation/${notif.status.id}`}
                                >
                                    <ForumIcon />
                                </LinkableIconButton>
                            </Tooltip>
                            {notif.type === "mention" ? (
                                <Tooltip title="Reply">
                                    <LinkableIconButton
                                        to={`/compose?reply=${
                                            notif.status.reblog
                                                ? notif.status.reblog.id
                                                : notif.status.id
                                        }&visibility=${
                                            notif.status.visibility
                                        }&acct=${
                                            notif.status.reblog
                                                ? notif.status.reblog.account
                                                      .acct
                                                : notif.status.account.acct
                                        }`}
                                    >
                                        <ReplyIcon />
                                    </LinkableIconButton>
                                </Tooltip>
                            ) : null}
                        </span>
                    ) : null}
                    <Tooltip title="Remove notification">
                        <IconButton
                            onClick={() => this.removeNotification(notif.id)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            </>
        );
    };

    /**
     * Render the notification page.
     */
    render() {
        const { classes } = this.props;
        return (
            <div className={classes.pageLayoutConstraints}>
                {this.state.viewDidLoad ? (
                    this.state.notifications &&
                    this.state.notifications.length > 0 ? (
                        <div>
                            <ListSubheader>Recent notifications</ListSubheader>
                            <Button
                                className={classes.clearAllButton}
                                variant="text"
                                onClick={() => this.toggleDeleteDialog()}
                            >
                                {" "}
                                Clear All
                            </Button>
                            <Paper className={classes.pageListConstraints}>
                                <List>
                                    {this.state.notifications.map(
                                        (notification: Notification) => {
                                            return this.createNotification(
                                                notification
                                            );
                                        }
                                    )}
                                </List>
                            </Paper>
                        </div>
                    ) : (
                        <div
                            className={classes.pageLayoutEmptyTextConstraints}
                            style={{ textAlign: "center" }}
                        >
                            <NotificationsIcon
                                color="action"
                                style={{ fontSize: 48 }}
                            />
                            <Typography variant="h6">All clear!</Typography>
                            <Typography paragraph>
                                It looks like you have no notifications. Why not
                                get the conversation going with a new post?
                            </Typography>
                            <br />
                        </div>
                    )
                ) : null}
                {this.state.viewDidError ? (
                    <Paper className={classes.errorCard}>
                        <Typography variant="h4">Bummer.</Typography>
                        <Typography variant="h6">
                            Something went wrong when loading this timeline.
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

                <div
                    className={classes.pageLayoutEmptyTextConstraints}
                    style={{ textAlign: "center" }}
                >
                    <Typography>
                        <Link
                            href={linkablePath("/#/settings#sp-notifications")}
                        >
                            Manage notification settings
                        </Link>
                    </Typography>
                </div>

                <Dialog
                    open={this.state.deleteDialogOpen}
                    onClose={() => this.toggleDeleteDialog()}
                >
                    <DialogTitle id="alert-dialog-title">
                        Delete all notifications?
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to delete all notifications?
                            This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => this.toggleDeleteDialog()}
                            color="primary"
                            autoFocus
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                this.removeAllNotifications();
                                this.toggleDeleteDialog();
                            }}
                            color="primary"
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default withStyles(styles)(withSnackbar(NotificationsPage));
