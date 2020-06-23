import React, { Component } from "react";
import {
    Typography,
    AppBar,
    Toolbar,
    IconButton,
    InputBase,
    Avatar,
    ListItemText,
    Divider,
    List,
    ListItemIcon,
    Hidden,
    Drawer,
    ListSubheader,
    ListItemAvatar,
    withStyles,
    Menu,
    MenuItem,
    ClickAwayListener,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    ListItem,
    Tooltip
} from "@material-ui/core";

import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import NotificationsIcon from "@material-ui/icons/Notifications";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import MailIcon from "@material-ui/icons/Mail";
import HomeIcon from "@material-ui/icons/Home";
import DomainIcon from "@material-ui/icons/Domain";
import PublicIcon from "@material-ui/icons/Public";
import GroupIcon from "@material-ui/icons/Group";
import SettingsIcon from "@material-ui/icons/Settings";
import InfoIcon from "@material-ui/icons/Info";
import CreateIcon from "@material-ui/icons/Create";
import SupervisedUserCircleIcon from "@material-ui/icons/SupervisedUserCircle";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import BuildIcon from "@material-ui/icons/Build";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

import { styles } from "./AppLayout.styles";
import { MultiAccount, UAccount } from "../../types/Account";
import {
    LinkableListItem,
    LinkableIconButton,
    LinkableFab
} from "../../interfaces/overrides";
import Mastodon from "megalodon";
import { Notification } from "../../types/Notification";
import { sendNotificationRequest } from "../../utilities/notifications";
import { withSnackbar } from "notistack";
import { getConfig, getUserDefaultBool } from "../../utilities/settings";
import {
    isDesktopApp,
    isDarwinApp,
    getElectronApp,
    linkablePath
} from "../../utilities/desktop";
import { Config } from "../../types/Config";
import {
    getAccountRegistry,
    removeAccountFromRegistry
} from "../../utilities/accounts";
import { isChildView } from "../../utilities/appbar";

/**
 * The pre-define state interface for the app layout.
 */
interface IAppLayoutState {
    /**
     * Whether the account menu is open or not.
     */
    acctMenuOpen: boolean;

    /**
     * Whether the drawer is open (mobile-only).
     */
    drawerOpenOnMobile: boolean;

    /**
     * The current user signed in.
     */
    currentUser?: UAccount;

    /**
     * The number of notifications received.
     */
    notificationCount: number;

    /**
     * Whether the log out dialog is open.
     */
    logOutOpen: boolean;

    /**
     * Whether federation has been enabled in the config.
     */
    enableFederation?: boolean;

    /**
     * The brand name of the app, if not "Hyperspace".
     */
    brandName?: string;

    /**
     * Whether the app is in development mode.
     */
    developerMode?: boolean;
}

/**
 * The base app layout class. Responsible for the search bar, navigation menus, etc.
 */
export class AppLayout extends Component<any, IAppLayoutState> {
    /**
     * The Mastodon client to operate with.
     */
    client: Mastodon;

    /**
     * A stream listener to listen for new streaming events from Mastodon.
     */
    streamListener: any;

    /**
     * Construct the app layout.
     * @param props The properties to pass in.
     */
    constructor(props: any) {
        super(props);

        // Create the Mastodon client
        this.client = new Mastodon(
            localStorage.getItem("access_token") as string,
            (localStorage.getItem("baseurl") as string) + "/api/v1"
        );

        // Initialize the state
        this.state = {
            drawerOpenOnMobile: false,
            acctMenuOpen: false,
            notificationCount: 0,
            logOutOpen: false
        };

        // Bind functions as properties to this class for reference
        this.toggleDrawerOnMobile = this.toggleDrawerOnMobile.bind(this);
        this.toggleAcctMenu = this.toggleAcctMenu.bind(this);
        this.clearBadge = this.clearBadge.bind(this);
    }

    /**
     * Run post-mount tasks such as getting account data and refreshing the config file.
     */
    componentDidMount() {
        // Get the account data.
        this.getAccountData();

        // Read the config file and then update the state.
        getConfig().then((result: any) => {
            if (result !== undefined) {
                let config: Config = result;
                this.setState({
                    enableFederation: config.federation.enablePublicTimeline,
                    brandName: config.branding
                        ? config.branding.name
                        : "Hyperspace",
                    developerMode: config.developer
                });
            }
        });

        // Listen for notifications.
        this.streamNotifications();
    }

    /**
     * Get updated credentials from Mastodon or pull information from local storage.
     */
    getAccountData() {
        // Try to get updated credentials from Mastodon.
        this.client
            .get("/accounts/verify_credentials")
            .then((resp: any) => {
                // Update the account if possible.
                let data: UAccount = resp.data;
                this.setState({ currentUser: data });
                sessionStorage.setItem("id", data.id);
            })
            .catch((err: Error) => {
                // Otherwise, pull from local storage.
                this.props.enqueueSnackbar(
                    "Couldn't find profile info: " + err.name
                );
                console.error(err.message);
                let acct = localStorage.getItem("account") as string;
                this.setState({ currentUser: JSON.parse(acct) });
            });
    }

    /**
     * Set up a stream listener and listen for notifications.
     */
    streamNotifications() {
        // Set up the stream listener.
        this.streamListener = this.client.stream("/streaming/user");

        // Set the count if the user asked to display the total count.
        if (getUserDefaultBool("displayAllOnNotificationBadge")) {
            this.client.get("/notifications").then((resp: any) => {
                let notifArray = resp.data;
                this.setState({ notificationCount: notifArray.length });
            });
        }

        // Listen for notifications.
        this.streamListener.on("notification", (notif: Notification) => {
            const notificationCount = this.state.notificationCount + 1;
            this.setState({ notificationCount });

            // Update the badge on the desktop.
            if (isDesktopApp()) {
                getElectronApp().setBadgeCount(notificationCount);
            }

            // Set up a push notification if the window isn't in focus.
            if (!document.hasFocus()) {
                let primaryMessage = "";
                let secondaryMessage = "";

                switch (notif.type) {
                    case "favourite":
                        primaryMessage =
                            (notif.account.display_name ||
                                "@" + notif.account.username) +
                            " favorited your post.";
                        if (notif.status) {
                            const div = document.createElement("div");
                            div.innerHTML = notif.status.content;
                            secondaryMessage =
                                (div.textContent || div.innerText || "").slice(
                                    0,
                                    100
                                ) + "...";
                        }
                        break;
                    case "follow":
                        primaryMessage =
                            (notif.account.display_name ||
                                "@" + notif.account.username) +
                            " is now following you.";
                        break;
                    case "mention":
                        primaryMessage =
                            (notif.account.display_name ||
                                "@" + notif.account.username) +
                            " mentioned you in a post.";
                        if (notif.status) {
                            const div = document.createElement("div");
                            div.innerHTML = notif.status.content;
                            secondaryMessage =
                                (div.textContent || div.innerText || "").slice(
                                    0,
                                    100
                                ) + "...";
                        }
                        break;
                    case "reblog":
                        primaryMessage =
                            (notif.account.display_name ||
                                "@" + notif.account.username) +
                            " reblogged your post.";
                        if (notif.status) {
                            const div = document.createElement("div");
                            div.innerHTML = notif.status.content;
                            secondaryMessage =
                                (div.textContent || div.innerText || "").slice(
                                    0,
                                    100
                                ) + "...";
                        }
                        break;
                }

                // Respectfully send the notification request.
                sendNotificationRequest(primaryMessage, secondaryMessage);
            }
        });
    }

    /**
     * Toggle the account menu.
     */
    toggleAcctMenu() {
        this.setState({ acctMenuOpen: !this.state.acctMenuOpen });
    }

    /**
     * Toggle the app drawer, if on mobile.
     */
    toggleDrawerOnMobile() {
        this.setState({
            drawerOpenOnMobile: !this.state.drawerOpenOnMobile
        });
    }

    /**
     * Toggle the logout dialog.
     */
    toggleLogOutDialog() {
        this.setState({ logOutOpen: !this.state.logOutOpen });
    }

    /**
     * Perform a search and redirect to the search page.
     * @param what The query input from the search box
     */
    searchForQuery(what: string) {
        what = what.replace(/^#/g, "tag:");
        // console.log(what);
        window.location.href = linkablePath("/#/search?query=" + what);
        // window.location.href = isDesktopApp()
        //     ? "hyperspace://hyperspace/app/index.html#/search?query=" + what
        //     : "/#/search?query=" + what;
    }

    /**
     * Clear login information, remove the account from the registry, and reload the web page.
     */
    logOutAndRestart() {
        let loginData = localStorage.getItem("login");
        if (loginData) {
            // Remove account from the registry.
            let registry = getAccountRegistry();

            registry.forEach((registryItem: MultiAccount, index: number) => {
                if (
                    registryItem.access_token ===
                    localStorage.getItem("access_token")
                ) {
                    removeAccountFromRegistry(index);
                }
            });

            // Clear some of the local storage fields.
            let items = ["login", "account", "baseurl", "access_token"];
            items.forEach(entry => {
                localStorage.removeItem(entry);
            });

            // Finally, reload.
            window.location.reload();
        }
    }

    /**
     * Clear the notifications badge.
     */
    clearBadge() {
        if (!getUserDefaultBool("displayAllOnNotificationBadge")) {
            this.setState({ notificationCount: 0 });
        }

        if (isDesktopApp() && getElectronApp().getBadgeCount() > 0) {
            getElectronApp().setBadgeCount(0);
        }
    }

    /**
     * Render the title bar.
     */
    titlebar() {
        const { classes } = this.props;
        if (isDarwinApp()) {
            return (
                <div className={classes.titleBarRoot}>
                    <Typography
                        className={classes.titleBarText}
                        color="inherit"
                    >
                        {this.state.brandName
                            ? this.state.brandName
                            : "Hyperspace"}{" "}
                        Desktop {this.state.developerMode ? "(Beta)" : null}
                    </Typography>
                </div>
            );
        } else if (process.env.NODE_ENV === "development") {
            return (
                <div className={classes.titleBarRoot}>
                    <Typography className={classes.titleBarText}>
                        <BuildIcon
                            color="inherit"
                            style={{ fontSize: "1em", verticalAlign: "middle" }}
                        />{" "}
                        Careful: you're running in developer mode.
                    </Typography>
                </div>
            );
        }
    }

    /**
     * Render the app drawer. On the desktop, this appears as a sidebar in larger layouts.
     */
    appDrawer() {
        const { classes } = this.props;
        return (
            <div>
                <List>
                    <div className={classes.drawerDisplayMobile}>
                        <LinkableListItem
                            button
                            key="profile-mobile"
                            to={`/profile/${
                                this.state.currentUser
                                    ? this.state.currentUser.id
                                    : "1"
                            }`}
                        >
                            <ListItemAvatar>
                                <Avatar
                                    alt="You"
                                    src={
                                        this.state.currentUser
                                            ? this.state.currentUser
                                                  .avatar_static
                                            : ""
                                    }
                                />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    this.state.currentUser
                                        ? this.state.currentUser.display_name ||
                                          this.state.currentUser.acct
                                        : "Loading..."
                                }
                                secondary={
                                    this.state.currentUser
                                        ? this.state.currentUser.acct
                                        : "Loading..."
                                }
                            />
                        </LinkableListItem>
                        <LinkableListItem
                            button
                            key="acctSwitch-module"
                            to="/welcome"
                        >
                            <ListItemIcon>
                                <SupervisedUserCircleIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    getAccountRegistry().length > 1
                                        ? "Switch account"
                                        : "Add account"
                                }
                            />
                        </LinkableListItem>
                        <ListItem
                            button
                            key="acctLogout-mobile"
                            onClick={() => this.toggleLogOutDialog()}
                        >
                            <ListItemIcon>
                                <ExitToAppIcon />
                            </ListItemIcon>
                            <ListItemText primary="Log out" />
                        </ListItem>
                        <Divider />
                    </div>
                    <ListSubheader>Timelines</ListSubheader>
                    <LinkableListItem button key="home" to="/home">
                        <ListItemIcon>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Home" />
                    </LinkableListItem>
                    <LinkableListItem button key="local" to="/local">
                        <ListItemIcon>
                            <DomainIcon />
                        </ListItemIcon>
                        <ListItemText primary="Local" />
                    </LinkableListItem>
                    {this.state.enableFederation ? (
                        <LinkableListItem button key="public" to="/public">
                            <ListItemIcon>
                                <PublicIcon />
                            </ListItemIcon>
                            <ListItemText primary="Public" />
                        </LinkableListItem>
                    ) : (
                        <ListItem disabled>
                            <ListItemIcon>
                                <PublicIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Public"
                                secondary="Disabled by admin"
                            />
                        </ListItem>
                    )}
                    <Divider />
                    <div className={classes.drawerDisplayMobile}>
                        <ListSubheader>Account</ListSubheader>
                        <LinkableListItem
                            button
                            key="announcements-mobile"
                            to="/announcements"
                        >
                            <ListItemIcon>
                                <AnnouncementIcon />
                            </ListItemIcon>
                            <ListItemText primary="Announcements" />
                        </LinkableListItem>
                        <LinkableListItem
                            button
                            key="notifications-mobile"
                            to="/notifications"
                        >
                            <ListItemIcon>
                                <Badge
                                    badgeContent={
                                        this.state.notificationCount > 0
                                            ? this.state.notificationCount
                                            : ""
                                    }
                                    color="secondary"
                                >
                                    <NotificationsIcon />
                                </Badge>
                            </ListItemIcon>
                            <ListItemText primary="Notifications" />
                        </LinkableListItem>
                        <LinkableListItem
                            button
                            key="messages-mobile"
                            to="/messages"
                        >
                            <ListItemIcon>
                                <MailIcon />
                            </ListItemIcon>
                            <ListItemText primary="Messages" />
                        </LinkableListItem>
                        <Divider />
                    </div>
                    <ListSubheader>Community</ListSubheader>
                    <LinkableListItem button key="activity" to="/activity">
                        <ListItemIcon>
                            <TrendingUpIcon />
                        </ListItemIcon>
                        <ListItemText primary="Activity" />
                    </LinkableListItem>
                    <LinkableListItem
                        button
                        key="recommended"
                        to="/recommended"
                    >
                        <ListItemIcon>
                            <GroupIcon />
                        </ListItemIcon>
                        <ListItemText primary="Recommended" />
                    </LinkableListItem>
                    <Divider />
                    <ListSubheader>More</ListSubheader>
                    <LinkableListItem button key="settings" to="/settings">
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Settings" />
                    </LinkableListItem>
                    <LinkableListItem button key="info" to="/about">
                        <ListItemIcon>
                            <InfoIcon />
                        </ListItemIcon>
                        <ListItemText primary="About" />
                    </LinkableListItem>
                </List>
            </div>
        );
    }

    /**
     * Render the entire layout.
     */
    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <div className={classes.stickyArea}>
                    {this.titlebar()}
                    <AppBar className={classes.appBar} position="static">
                        <Toolbar>
                            {isDesktopApp() &&
                            isChildView(window.location.hash) ? (
                                <IconButton
                                    className={classes.appBarBackButton}
                                    color="inherit"
                                    aria-label="Go back"
                                    onClick={() => window.history.back()}
                                >
                                    <ArrowBackIcon />
                                </IconButton>
                            ) : null}

                            <IconButton
                                className={classes.appBarMenuButton}
                                color="inherit"
                                aria-label="Open drawer"
                                onClick={this.toggleDrawerOnMobile}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography
                                className={classes.appBarTitle}
                                variant="h6"
                                color="inherit"
                                noWrap
                            >
                                {this.state.brandName
                                    ? this.state.brandName
                                    : "Hyperspace"}
                            </Typography>
                            <div className={classes.appBarFlexGrow} />
                            <div className={classes.appBarSearch}>
                                <div className={classes.appBarSearchIcon}>
                                    <SearchIcon />
                                </div>
                                <InputBase
                                    placeholder="Search..."
                                    classes={{
                                        root: classes.appBarSearchInputRoot,
                                        input: classes.appBarSearchInputInput
                                    }}
                                    onKeyUp={event => {
                                        if (event.keyCode === 13) {
                                            this.searchForQuery(
                                                event.currentTarget.value
                                            );
                                        }
                                    }}
                                />
                            </div>
                            <div className={classes.appBarFlexGrow} />
                            <div className={classes.appBarActionButtons}>
                                <Tooltip title="Announcements">
                                    <LinkableIconButton
                                        to="/announcements"
                                        color="inherit"
                                    >
                                        <AnnouncementIcon />
                                    </LinkableIconButton>
                                </Tooltip>
                                <Tooltip title="Notifications">
                                    <LinkableIconButton
                                        color="inherit"
                                        to="/notifications"
                                        onClick={this.clearBadge}
                                    >
                                        <Badge
                                            badgeContent={
                                                this.state.notificationCount > 0
                                                    ? this.state
                                                          .notificationCount
                                                    : ""
                                            }
                                            color="secondary"
                                        >
                                            <NotificationsIcon />
                                        </Badge>
                                    </LinkableIconButton>
                                </Tooltip>
                                <Tooltip title="Direct messages">
                                    <LinkableIconButton
                                        color="inherit"
                                        to="/messages"
                                    >
                                        <MailIcon />
                                    </LinkableIconButton>
                                </Tooltip>
                                <Tooltip title="Your account">
                                    <IconButton
                                        id="acctMenuBtn"
                                        onClick={this.toggleAcctMenu}
                                    >
                                        <Avatar
                                            className={
                                                classes.appBarAcctMenuIcon
                                            }
                                            alt="You"
                                            src={
                                                this.props.avatarURL
                                                    ? this.props.avatarURL
                                                    : this.state.currentUser
                                                    ? this.state.currentUser
                                                          .avatar_static
                                                    : ""
                                            }
                                        />
                                    </IconButton>
                                </Tooltip>

                                <Menu
                                    id="acct-menu"
                                    anchorEl={document.getElementById(
                                        "acctMenuBtn"
                                    )}
                                    open={this.state.acctMenuOpen}
                                    className={classes.acctMenu}
                                >
                                    <ClickAwayListener
                                        onClickAway={this.toggleAcctMenu}
                                    >
                                        <div>
                                            <LinkableListItem
                                                button={true}
                                                onClick={this.toggleAcctMenu}
                                                to={`/profile/${
                                                    this.state.currentUser
                                                        ? this.state.currentUser
                                                              .id
                                                        : "1"
                                                }`}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar
                                                        alt="You"
                                                        src={
                                                            this.props.avatarURL
                                                                ? this.props
                                                                      .avatarURL
                                                                : this.state
                                                                      .currentUser
                                                                ? this.state
                                                                      .currentUser
                                                                      .avatar_static
                                                                : ""
                                                        }
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        this.state.currentUser
                                                            ? this.state
                                                                  .currentUser
                                                                  .display_name ||
                                                              this.state
                                                                  .currentUser
                                                                  .acct
                                                            : "Loading..."
                                                    }
                                                    secondary={
                                                        "@" +
                                                        (this.state.currentUser
                                                            ? this.state
                                                                  .currentUser
                                                                  .acct
                                                            : "Loading...")
                                                    }
                                                />
                                            </LinkableListItem>
                                            <Divider />
                                            <LinkableListItem
                                                button={true}
                                                onClick={this.toggleAcctMenu}
                                                to={"/you"}
                                            >
                                                <ListItemText>
                                                    Edit profile
                                                </ListItemText>
                                            </LinkableListItem>
                                            <LinkableListItem
                                                button={true}
                                                onClick={this.toggleAcctMenu}
                                                to={"/requests"}
                                            >
                                                <ListItemText>
                                                    Manage follow requests
                                                </ListItemText>
                                            </LinkableListItem>
                                            <Divider />
                                            <LinkableListItem
                                                to={"/welcome"}
                                                button={true}
                                            >
                                                <ListItemText>
                                                    {getAccountRegistry()
                                                        .length > 1
                                                        ? "Switch account"
                                                        : "Add account"}
                                                </ListItemText>
                                            </LinkableListItem>
                                            <MenuItem
                                                onClick={() =>
                                                    this.toggleLogOutDialog()
                                                }
                                            >
                                                Log out
                                            </MenuItem>
                                        </div>
                                    </ClickAwayListener>
                                </Menu>
                            </div>
                        </Toolbar>
                    </AppBar>
                    <nav className={classes.drawer}>
                        <Hidden mdUp implementation="css">
                            <Drawer
                                container={this.props.container}
                                variant="temporary"
                                anchor={"left"}
                                open={this.state.drawerOpenOnMobile}
                                onClick={this.toggleDrawerOnMobile}
                                classes={{ paper: classes.drawerPaper }}
                            >
                                {this.appDrawer()}
                            </Drawer>
                        </Hidden>
                        <Hidden smDown implementation="css">
                            <Drawer
                                classes={{
                                    paper: this.titlebar()
                                        ? classes.drawerPaperWithTitleAndAppBar
                                        : classes.drawerPaperWithAppBar
                                }}
                                variant="permanent"
                                open
                            >
                                {this.appDrawer()}
                            </Drawer>
                        </Hidden>
                    </nav>
                </div>
                {this.logoutDialog()}
                <Tooltip title="Create a new post">
                    <LinkableFab
                        to="/compose"
                        className={classes.composeButton}
                        color="secondary"
                        aria-label="Compose"
                    >
                        <CreateIcon />
                    </LinkableFab>
                </Tooltip>
            </div>
        );
    }

    logoutDialog() {
        return (
            <Dialog
                open={this.state.logOutOpen}
                onClose={() => this.toggleLogOutDialog()}
            >
                <DialogTitle id="alert-dialog-title">
                    Log out of{" "}
                    {this.state.brandName ? this.state.brandName : "Hyperspace"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <Typography paragraph>
                            You'll need to remove{" "}
                            {this.state.brandName
                                ? this.state.brandName
                                : "Hyperspace"}{" "}
                            from your list of authorized apps and log in again
                            if you want to use{" "}
                            {this.state.brandName
                                ? this.state.brandName
                                : "Hyperspace"}
                            .
                        </Typography>
                        <Typography paragraph>
                            Logging out will also remove this account from the
                            account list.
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => this.toggleLogOutDialog()}
                        color="primary"
                        autoFocus
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            this.logOutAndRestart();
                        }}
                        color="primary"
                    >
                        Log out
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default withStyles(styles)(withSnackbar(AppLayout));
