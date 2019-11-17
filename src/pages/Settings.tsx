import React, { Component } from "react";
import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListSubheader,
    ListItemSecondaryAction,
    Paper,
    IconButton,
    withStyles,
    Button,
    Switch,
    Dialog,
    DialogTitle,
    DialogContent,
    RadioGroup,
    FormControlLabel,
    Radio,
    DialogActions,
    DialogContentText,
    Grid,
    Theme,
    Typography,
    Avatar,
    Toolbar,
    Tooltip
} from "@material-ui/core";
import { styles } from "./PageLayout.styles";
import {
    setUserDefaultBool,
    getUserDefaultBool,
    getUserDefaultTheme,
    setUserDefaultTheme,
    getUserDefaultVisibility,
    setUserDefaultVisibility,
    getConfig
} from "../utilities/settings";
import {
    canSendNotifications,
    browserSupportsNotificationRequests
} from "../utilities/notifications";
import { themes, defaultTheme } from "../types/HyperspaceTheme";
import ThemePreview from "../components/ThemePreview";
import {
    setHyperspaceTheme,
    getHyperspaceTheme,
    getDarkModeFromSystem
} from "../utilities/themes";
import { Visibility } from "../types/Visibility";
import { LinkableButton, LinkableIconButton } from "../interfaces/overrides";

import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import DevicesIcon from "@material-ui/icons/Devices";
import Brightness3Icon from "@material-ui/icons/Brightness3";
import PaletteIcon from "@material-ui/icons/Palette";
import AccountEditIcon from "mdi-material-ui/AccountEdit";
import MastodonIcon from "mdi-material-ui/Mastodon";
import VisibilityIcon from "@material-ui/icons/Visibility";
import NotificationsIcon from "@material-ui/icons/Notifications";
import BellAlertIcon from "mdi-material-ui/BellAlert";
import RefreshIcon from "@material-ui/icons/Refresh";
import UndoIcon from "@material-ui/icons/Undo";
import DomainDisabledIcon from "@material-ui/icons/DomainDisabled";
import AccountSettingsIcon from "mdi-material-ui/AccountSettings";
import AlphabeticalVariantOffIcon from "mdi-material-ui/AlphabeticalVariantOff";

import { Config } from "../types/Config";
import { Account } from "../types/Account";
import Mastodon from "megalodon";
import { isDarwinApp } from "../utilities/desktop";

interface ISettingsState {
    darkModeEnabled: boolean;
    systemDecidesDarkMode: boolean;
    pushNotificationsEnabled: boolean;
    badgeDisplaysAllNotifs: boolean;
    selectThemeName: string;
    themeDialogOpen: boolean;
    visibilityDialogOpen: boolean;
    resetHyperspaceDialog: boolean;
    resetSettingsDialog: boolean;
    previewTheme: Theme;
    defaultVisibility: Visibility;
    brandName: string;
    federated: boolean;
    currentUser?: Account;
    imposeCharacterLimit: boolean;
}

class SettingsPage extends Component<any, ISettingsState> {
    client: Mastodon;

    constructor(props: any) {
        super(props);

        this.client = new Mastodon(
            localStorage.getItem("access_token") as string,
            (localStorage.getItem("baseurl") as string) + "/api/v1"
        );

        this.state = {
            darkModeEnabled: getUserDefaultBool("darkModeEnabled"),
            systemDecidesDarkMode: getUserDefaultBool("systemDecidesDarkMode"),
            pushNotificationsEnabled: canSendNotifications(),
            badgeDisplaysAllNotifs: getUserDefaultBool(
                "displayAllOnNotificationBadge"
            ),
            selectThemeName: getUserDefaultTheme().key,
            themeDialogOpen: false,
            visibilityDialogOpen: false,
            resetHyperspaceDialog: false,
            resetSettingsDialog: false,
            previewTheme:
                setHyperspaceTheme(getUserDefaultTheme()) ||
                setHyperspaceTheme(defaultTheme),
            defaultVisibility: getUserDefaultVisibility() || "public",
            brandName: "Hyperspace",
            federated: true,
            imposeCharacterLimit: getUserDefaultBool("imposeCharacterLimit")
        };

        this.toggleDarkMode = this.toggleDarkMode.bind(this);
        this.toggleSystemDarkMode = this.toggleSystemDarkMode.bind(this);
        this.togglePushNotifications = this.togglePushNotifications.bind(this);
        this.toggleBadgeCount = this.toggleBadgeCount.bind(this);
        this.toggleThemeDialog = this.toggleThemeDialog.bind(this);
        this.toggleVisibilityDialog = this.toggleVisibilityDialog.bind(this);
        this.changeThemeName = this.changeThemeName.bind(this);
        this.changeTheme = this.changeTheme.bind(this);
        this.setVisibility = this.setVisibility.bind(this);
    }

    componentDidMount() {
        getConfig()
            .then((config: any) => {
                this.setState({
                    brandName: config.branding.name
                });
            })
            .catch((err: Error) => {
                console.error(err.message);
            });
        this.getFederatedStatus();

        this.client
            .get("/accounts/verify_credentials")
            .then((resp: any) => {
                let data: Account = resp.data;
                this.setState({ currentUser: data });
            })
            .catch((err: Error) => {
                let acct = localStorage.getItem("account");
                if (acct) {
                    this.setState({ currentUser: JSON.parse(acct) });
                } else {
                    this.props.enqueueSnackbar(
                        "Couldn't find profile info: " + err.name
                    );
                    console.error(err.message);
                }
            });
    }

    getFederatedStatus() {
        getConfig().then((result: any) => {
            if (result !== undefined) {
                let config: Config = result;
                console.log(!config.federation.allowPublicPosts);
                this.setState({
                    federated: config.federation.allowPublicPosts
                });
            }
        });
    }

    toggleDarkMode() {
        this.setState({ darkModeEnabled: !this.state.darkModeEnabled });
        setUserDefaultBool("darkModeEnabled", !this.state.darkModeEnabled);
        window.location.reload();
    }

    toggleSystemDarkMode() {
        this.setState({
            systemDecidesDarkMode: !this.state.systemDecidesDarkMode
        });
        setUserDefaultBool(
            "systemDecidesDarkMode",
            !this.state.systemDecidesDarkMode
        );
        window.location.reload();
    }

    togglePushNotifications() {
        this.setState({
            pushNotificationsEnabled: !this.state.pushNotificationsEnabled
        });
        setUserDefaultBool(
            "enablePushNotifications",
            !this.state.pushNotificationsEnabled
        );
    }

    toggleBadgeCount() {
        this.setState({
            badgeDisplaysAllNotifs: !this.state.badgeDisplaysAllNotifs
        });
        setUserDefaultBool(
            "displayAllOnNotificationBadge",
            !this.state.badgeDisplaysAllNotifs
        );
    }

    toggleThemeDialog() {
        this.setState({ themeDialogOpen: !this.state.themeDialogOpen });
    }

    toggleVisibilityDialog() {
        this.setState({
            visibilityDialogOpen: !this.state.visibilityDialogOpen
        });
    }

    toggleCharacterLimit() {
        this.setState({
            imposeCharacterLimit: !this.state.imposeCharacterLimit
        });
        setUserDefaultBool(
            "imposeCharacterLimit",
            !this.state.imposeCharacterLimit
        );
    }

    toggleResetDialog() {
        this.setState({
            resetHyperspaceDialog: !this.state.resetHyperspaceDialog
        });
    }

    toggleResetSettingsDialog() {
        this.setState({ resetSettingsDialog: !this.state.resetSettingsDialog });
    }

    changeTheme() {
        setUserDefaultTheme(this.state.selectThemeName);
        window.location.reload();
    }

    changeThemeName(theme: string) {
        let previewTheme = setHyperspaceTheme(getHyperspaceTheme(theme));
        this.setState({ selectThemeName: theme, previewTheme });
    }

    changeVisibility(to: Visibility) {
        this.setState({ defaultVisibility: to });
    }

    setVisibility() {
        setUserDefaultVisibility(this.state.defaultVisibility);
        this.toggleVisibilityDialog();
    }

    reset() {
        localStorage.clear();
        window.location.reload();
    }

    refresh() {
        let settings = [
            "darkModeEnabled",
            "enablePushNotifications",
            "clearNotificationsOnRead",
            "theme",
            "displayAllOnNotificationBadge",
            "defaultVisibility"
        ];
        settings.forEach(setting => {
            localStorage.removeItem(setting);
        });
        window.location.reload();
    }

    showThemeDialog() {
        const { classes } = this.props;
        return (
            <Dialog
                open={this.state.themeDialogOpen}
                disableBackdropClick
                disableEscapeKeyDown
                maxWidth="md"
                fullWidth={true}
                aria-labelledby="confirmation-dialog-title"
            >
                <DialogTitle id="confirmation-dialog-title">
                    Choose a theme
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={16}>
                        <Grid item xs={12} md={6}>
                            <RadioGroup
                                aria-label="Theme"
                                name="colorScheme"
                                value={this.state.selectThemeName}
                                onChange={(e, value) =>
                                    this.changeThemeName(value)
                                }
                            >
                                {themes.map(theme => (
                                    <FormControlLabel
                                        value={theme.key}
                                        key={theme.key}
                                        control={<Radio />}
                                        label={theme.name}
                                    />
                                ))}
                                ))}
                            </RadioGroup>
                        </Grid>
                        <Grid
                            item
                            xs={12}
                            md={6}
                            className={classes.desktopOnly}
                        >
                            <Typography variant="h6" component="p">
                                Theme preview
                            </Typography>
                            <ThemePreview theme={this.state.previewTheme} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.toggleThemeDialog} color="default">
                        Cancel
                    </Button>
                    <Button onClick={this.changeTheme} color="secondary">
                        Set theme
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    showVisibilityDialog() {
        return (
            <Dialog
                open={this.state.visibilityDialogOpen}
                disableBackdropClick
                disableEscapeKeyDown
                maxWidth="xs"
                fullWidth={true}
                aria-labelledby="confirmation-dialog-title"
            >
                <DialogTitle id="confirmation-dialog-title">
                    Set your default visibility
                </DialogTitle>
                <DialogContent>
                    <RadioGroup
                        aria-label="Visibility"
                        name="visibility"
                        value={this.state.defaultVisibility}
                        onChange={(e, value) =>
                            this.changeVisibility(value as Visibility)
                        }
                    >
                        <FormControlLabel
                            value={"public"}
                            key={"public"}
                            control={<Radio />}
                            label={`Public ${
                                this.state.federated
                                    ? ""
                                    : "(disabled by provider)"
                            }`}
                            disabled={!this.state.federated}
                        />
                        <FormControlLabel
                            value={"unlisted"}
                            key={"unlisted"}
                            control={<Radio />}
                            label={"Unlisted"}
                        />
                        <FormControlLabel
                            value={"private"}
                            key={"private"}
                            control={<Radio />}
                            label={"Private (followers only)"}
                        />
                        <FormControlLabel
                            value={"direct"}
                            key={"direct"}
                            control={<Radio />}
                            label={"Direct"}
                        />
                    </RadioGroup>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={this.toggleVisibilityDialog}
                        color="default"
                    >
                        Cancel
                    </Button>
                    <Button onClick={this.setVisibility} color="secondary">
                        Set default
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    showResetSettingsDialog() {
        return (
            <Dialog
                open={this.state.resetSettingsDialog}
                onClose={() => this.toggleResetSettingsDialog()}
            >
                <DialogTitle id="alert-dialog-title">
                    Are you sure you want to refresh settings?
                </DialogTitle>
                <DialogActions>
                    <Button
                        onClick={() => this.toggleResetSettingsDialog()}
                        color="primary"
                        autoFocus
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            this.refresh();
                        }}
                        color="primary"
                    >
                        Refresh
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    showResetDialog() {
        return (
            <Dialog
                open={this.state.resetHyperspaceDialog}
                onClose={() => this.toggleResetDialog()}
            >
                <DialogTitle id="alert-dialog-title">
                    Reset {this.state.brandName}?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to reset {this.state.brandName}?
                        You'll need to re-authorize {this.state.brandName}{" "}
                        access again.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => this.toggleResetDialog()}
                        color="primary"
                        autoFocus
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            this.reset();
                        }}
                        color="primary"
                    >
                        Reset
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    render() {
        const { classes } = this.props;
        return (
            <div>
                <div className={classes.pageLayoutMinimalConstraints}>
                    {this.state.currentUser ? (
                        <div className={classes.pageHeroBackground}>
                            <div
                                className={classes.pageHeroBackgroundImage}
                                style={{
                                    backgroundImage: `url("${this.state.currentUser.header_static}")`
                                }}
                            />
                            <div className={classes.profileContent}>
                                <br />
                                <Avatar
                                    className={classes.settingsAvatar}
                                    src={this.state.currentUser.avatar_static}
                                />
                                <div
                                    className={classes.profileUserBox}
                                    style={{ margin: "auto" }}
                                >
                                    <Typography
                                        className={classes.settingsHeaderText}
                                        color="inherit"
                                        component="h1"
                                    >
                                        {this.state.currentUser.display_name ||
                                            this.state.currentUser.username}
                                    </Typography>
                                    <Typography
                                        color="inherit"
                                        className={classes.settingsDetailText}
                                        component="p"
                                    >
                                        @{this.state.currentUser.acct}
                                    </Typography>
                                </div>
                                <div className={classes.pageGrow} />
                                <Toolbar>
                                    <Tooltip title="Edit profile">
                                        <LinkableIconButton
                                            to={"/you"}
                                            color="inherit"
                                        >
                                            <AccountEditIcon />
                                        </LinkableIconButton>
                                    </Tooltip>
                                    <Tooltip title="Manage blocked servers">
                                        <LinkableIconButton
                                            to={"/blocked"}
                                            color="inherit"
                                        >
                                            <DomainDisabledIcon />
                                        </LinkableIconButton>
                                    </Tooltip>
                                    <Tooltip title="Manage follow requests">
                                        <LinkableIconButton
                                            to={"/requests"}
                                            color="inherit"
                                        >
                                            <AccountSettingsIcon />
                                        </LinkableIconButton>
                                    </Tooltip>
                                    <Tooltip title="Configure on Mastodon">
                                        <IconButton
                                            href={
                                                (localStorage.getItem(
                                                    "baseurl"
                                                ) as string) +
                                                "/settings/preferences"
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            color="inherit"
                                        >
                                            <MastodonIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Toolbar>
                            </div>
                        </div>
                    ) : null}
                    <div className={classes.pageContentLayoutConstraints}>
                        <ListSubheader>Appearance</ListSubheader>
                        <Paper className={classes.pageListConstraints}>
                            <List>
                                <ListItem>
                                    <ListItemAvatar>
                                        <DevicesIcon color="action" />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary="Match system appearance"
                                        secondary="Follows your device's preferences to toggle dark mode"
                                    />
                                    <ListItemSecondaryAction>
                                        <Switch
                                            checked={
                                                this.state.systemDecidesDarkMode
                                            }
                                            onChange={this.toggleSystemDarkMode}
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {!this.state.systemDecidesDarkMode ? (
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Brightness3Icon color="action" />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary="Dark mode"
                                            secondary="Toggles light or dark theme"
                                        />
                                        <ListItemSecondaryAction>
                                            <Switch
                                                disabled={
                                                    this.state
                                                        .systemDecidesDarkMode
                                                }
                                                checked={
                                                    this.state.darkModeEnabled
                                                }
                                                onChange={this.toggleDarkMode}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ) : null}

                                <ListItem>
                                    <ListItemAvatar>
                                        <PaletteIcon color="action" />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary="Interface theme"
                                        secondary="Defines the color palette used for the interface"
                                    />
                                    <ListItemSecondaryAction>
                                        <Button
                                            onClick={this.toggleThemeDialog}
                                        >
                                            Set theme
                                        </Button>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </List>
                        </Paper>
                        <br />
                        <ListSubheader>Composer</ListSubheader>
                        <Paper className={classes.pageListConstraints}>
                            <List>
                                <ListItem>
                                    <ListItemAvatar>
                                        <VisibilityIcon color="action" />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary="Default post visibility"
                                        secondary="Creating posts in the composer will use this visiblity"
                                    />
                                    <ListItemSecondaryAction>
                                        <Button
                                            onClick={
                                                this.toggleVisibilityDialog
                                            }
                                        >
                                            Change
                                        </Button>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <ListItem>
                                    <ListItemAvatar>
                                        <AlphabeticalVariantOffIcon color="action" />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary="Impose character limit"
                                        secondary="Impose a character limit when creating posts"
                                    />
                                    <ListItemSecondaryAction>
                                        <Switch
                                            checked={
                                                this.state.imposeCharacterLimit
                                            }
                                            onChange={() =>
                                                this.toggleCharacterLimit()
                                            }
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </List>
                        </Paper>
                        <br />
                        <ListSubheader>Notifications</ListSubheader>
                        <Paper className={classes.pageListConstraints}>
                            <List>
                                <ListItem>
                                    <ListItemAvatar>
                                        <NotificationsIcon color="action" />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary="Enable push notifications"
                                        secondary={
                                            getUserDefaultBool(
                                                "userDeniedNotification"
                                            )
                                                ? "Check your browser's notification permissions."
                                                : browserSupportsNotificationRequests()
                                                ? "Sends a push notification when not focused."
                                                : "Notifications aren't supported."
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Switch
                                            checked={
                                                this.state
                                                    .pushNotificationsEnabled
                                            }
                                            onChange={
                                                this.togglePushNotifications
                                            }
                                            disabled={
                                                !browserSupportsNotificationRequests() ||
                                                getUserDefaultBool(
                                                    "userDeniedNotification"
                                                )
                                            }
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <ListItem>
                                    <ListItemAvatar>
                                        <BellAlertIcon color="action" />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary="Notification badge counts all notifications"
                                        secondary={
                                            "Counts all notifications, read or unread."
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Switch
                                            checked={
                                                this.state
                                                    .badgeDisplaysAllNotifs
                                            }
                                            onChange={this.toggleBadgeCount}
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </List>
                        </Paper>
                        <br />
                        <ListSubheader>Advanced</ListSubheader>
                        <Paper className={classes.pageListConstraints}>
                            <List>
                                <ListItem>
                                    <ListItemAvatar>
                                        <RefreshIcon color="action" />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary="Refresh settings"
                                        secondary="Resets the settings to defaults."
                                    />
                                    <ListItemSecondaryAction>
                                        <Button
                                            onClick={() =>
                                                this.toggleResetSettingsDialog()
                                            }
                                        >
                                            Refresh
                                        </Button>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <ListItem>
                                    <ListItemAvatar>
                                        <UndoIcon color="action" />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={`Reset ${this.state.brandName}`}
                                        secondary="Deletes all data and resets the app"
                                    />
                                    <ListItemSecondaryAction>
                                        <Button
                                            onClick={() =>
                                                this.toggleResetDialog()
                                            }
                                        >
                                            Reset
                                        </Button>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </List>
                        </Paper>
                        {this.showThemeDialog()}
                        {this.showVisibilityDialog()}
                        {this.showResetDialog()}
                        {this.showResetSettingsDialog()}
                    </div>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(SettingsPage);
