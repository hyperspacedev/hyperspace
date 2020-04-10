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
    getElectronApp
} from "../../utilities/desktop";
import { Config } from "../../types/Config";
import {
    getAccountRegistry,
    removeAccountFromRegistry
} from "../../utilities/accounts";

interface IAppLayoutState {
    acctMenuOpen: boolean;
    drawerOpenOnMobile: boolean;
    currentUser?: UAccount;
    notificationCount: number;
    logOutOpen: boolean;
    enableFederation?: boolean;
    brandName?: string;
    developerMode?: boolean;
}

export class AppLayout extends Component<any, IAppLayoutState> {
    client: Mastodon;
    streamListener: any;

    constructor(props: any) {
        super(props);

        this.client = new Mastodon(
            localStorage.getItem("access_token") as string,
            (localStorage.getItem("baseurl") as string) + "/api/v1"
        );

        this.state = {
            drawerOpenOnMobile: false,
            acctMenuOpen: false,
            notificationCount: 0,
            logOutOpen: false
        };

        this.toggleDrawerOnMobile = this.toggleDrawerOnMobile.bind(this);
        this.toggleAcctMenu = this.toggleAcctMenu.bind(this);
        this.clearBadge = this.clearBadge.bind(this);
    }

    componentDidMount() {
        this.getAccountData();

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

        this.streamNotifications();
    }

    getAccountData() {
        this.client
            .get("/accounts/verify_credentials")
            .then((resp: any) => {
                let data: UAccount = resp.data;
                this.setState({ currentUser: data });
                sessionStorage.setItem("id", data.id);
            })
            .catch((err: Error) => {
                this.props.enqueueSnackbar(
                    "Couldn't find profile info: " + err.name
                );
                console.error(err.message);
                let acct = localStorage.getItem("account") as string;
                this.setState({ currentUser: JSON.parse(acct) });
            });
    }

    streamNotifications() {
        this.streamListener = this.client.stream("/streaming/user");

        if (getUserDefaultBool("displayAllOnNotificationBadge")) {
            this.client.get("/notifications").then((resp: any) => {
                let notifArray = resp.data;
                this.setState({ notificationCount: notifArray.length });
            });
        }

        this.streamListener.on("notification", (notif: Notification) => {
            const notificationCount = this.state.notificationCount + 1;
            this.setState({ notificationCount });

            if (isDesktopApp()) {
                getElectronApp().setBadgeCount(notificationCount);
            }

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

                sendNotificationRequest(primaryMessage, secondaryMessage);
            }
        });
    }

    toggleAcctMenu() {
        this.setState({ acctMenuOpen: !this.state.acctMenuOpen });
    }

    toggleDrawerOnMobile() {
        this.setState({
            drawerOpenOnMobile: !this.state.drawerOpenOnMobile
        });
    }

    toggleLogOutDialog() {
        this.setState({ logOutOpen: !this.state.logOutOpen });
    }

    searchForQuery(what: string) {
        what = what.replace(/^#/g, "tag:");
        window.location.href = isDesktopApp()
            ? "hyperspace://hyperspace/app/index.html#/search?query=" + what
            : "/#/search?query=" + what;
    }

    logOutAndRestart() {
        let loginData = localStorage.getItem("login");
        if (loginData) {
            let registry = getAccountRegistry();

            registry.forEach((registryItem: MultiAccount, index: number) => {
                if (
                    registryItem.access_token ===
                    localStorage.getItem("access_token")
                ) {
                    removeAccountFromRegistry(index);
                }
            });

            let items = ["login", "account", "baseurl", "access_token"];
            items.forEach(entry => {
                localStorage.removeItem(entry);
            });

            window.location.reload();
        }
    }

    clearBadge() {
        if (!getUserDefaultBool("displayAllOnNotificationBadge")) {
            this.setState({ notificationCount: 0 });
        }

        if (isDesktopApp() && getElectronApp().getBadgeCount() > 0) {
            getElectronApp().setBadgeCount(0);
        }
    }

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
                        🛠 Careful: you're running in developer mode.
                    </Typography>
                </div>
            );
        }
    }

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
                    <ListSubheader>More</ListSubheader>
                    <LinkableListItem
                        button
                        key="recommended"
                        to="/recommended"
                    >
                        <ListItemIcon>
                            <GroupIcon />
                        </ListItemIcon>
                        <ListItemText primary="Who to follow" />
                    </LinkableListItem>
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

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <div className={classes.stickyArea}>
                    {this.titlebar()}
                    <AppBar className={classes.appBar} position="static">
                        <Toolbar>
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
                                                this.state.currentUser
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
                                                            this.state
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
                                                to={"/you"}
                                            >
                                                <ListItemText>
                                                    Edit profile
                                                </ListItemText>
                                            </LinkableListItem>
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
                                onClose={this.toggleDrawerOnMobile}
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
