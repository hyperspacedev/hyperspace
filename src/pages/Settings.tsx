import React, { Component } from 'react';
import {
    List, 
    ListItem, 
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
    Theme
} from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import {styles} from './PageLayout.styles';
import {setUserDefaultBool, getUserDefaultBool, getUserDefaultTheme, setUserDefaultTheme} from '../utilities/settings';
import {canSendNotifications, browserSupportsNotificationRequests} from '../utilities/notifications';
import {themes, defaultTheme} from '../types/HyperspaceTheme';
import ThemePreview from '../components/ThemePreview';
import {setHyperspaceTheme, getHyperspaceTheme} from '../utilities/themes';

interface ISettingsState {
    darkModeEnabled: boolean;
    pushNotificationsEnabled: boolean;
    badgeDisplaysAllNotifs: boolean;
    selectThemeName: string;
    themeDialogOpen: boolean;
    resetHyperspaceDialog: boolean;
    resetSettingsDialog: boolean;
    previewTheme: Theme;
}

class SettingsPage extends Component<any, ISettingsState> {

    constructor(props: any) {
        super(props);

        this.state = {
            darkModeEnabled: getUserDefaultBool('darkModeEnabled'),
            pushNotificationsEnabled: canSendNotifications(),
            badgeDisplaysAllNotifs: getUserDefaultBool('displayAllOnNotificationBadge'),
            selectThemeName: getUserDefaultTheme().key,
            themeDialogOpen: false,
            resetHyperspaceDialog: false,
            resetSettingsDialog: false,
            previewTheme: setHyperspaceTheme(getUserDefaultTheme()) || setHyperspaceTheme(defaultTheme)
        }

        this.toggleDarkMode = this.toggleDarkMode.bind(this);
        this.togglePushNotifications = this.togglePushNotifications.bind(this);
        this.toggleBadgeCount = this.toggleBadgeCount.bind(this);
        this.toggleThemeDialog = this.toggleThemeDialog.bind(this);
        this.changeThemeName = this.changeThemeName.bind(this);
        this.changeTheme = this.changeTheme.bind(this);
    }

    toggleDarkMode() {
        this.setState({ darkModeEnabled: !this.state.darkModeEnabled });
        setUserDefaultBool('darkModeEnabled', !this.state.darkModeEnabled);
        window.location.reload();
    }

    togglePushNotifications() {
        this.setState({ pushNotificationsEnabled: !this.state.pushNotificationsEnabled });
        setUserDefaultBool('enablePushNotifications', !this.state.pushNotificationsEnabled);
    }

    toggleBadgeCount() {
        this.setState({ badgeDisplaysAllNotifs: !this.state.badgeDisplaysAllNotifs });
        setUserDefaultBool('displayAllOnNotificationBadge', !this.state.badgeDisplaysAllNotifs);
    }

    toggleThemeDialog() {
        this.setState({ themeDialogOpen: !this.state.themeDialogOpen });
    }

    toggleResetDialog() {
        this.setState({ resetHyperspaceDialog: !this.state.resetHyperspaceDialog });
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

    reset() {
        localStorage.clear();
        window.location.reload();
    }

    refresh() {
        let settings = ['darkModeEnabled', 'enablePushNotifications', 'clearNotificationsOnRead', 'theme', 'displayAllOnNotificationBadge'];
        settings.forEach(setting => {
            localStorage.removeItem(setting);
        })
        window.location.reload();
    }

    showThemeDialog() {
        const {classes} = this.props;
        return (
            <Dialog
                open={this.state.themeDialogOpen}
                disableBackdropClick
                disableEscapeKeyDown
                maxWidth="md"
                fullWidth={true}
                aria-labelledby="confirmation-dialog-title"
            >
                <DialogTitle id="confirmation-dialog-title">Choose a color scheme</DialogTitle>
                <DialogContent>
                    <Grid container spacing={16}>
                        <Grid item xs={12} md={6}>
                            <RadioGroup
                                aria-label="Color Scheme"
                                name="colorScheme"
                                value={this.state.selectThemeName}
                                onChange={(e, value) => this.changeThemeName(value)}
                            >
                                {themes.map(theme => (
                                    <FormControlLabel value={theme.key} key={theme.key} control={<Radio />} label={theme.name} />
                                ))}
                                ))}
                            </RadioGroup>
                        </Grid>
                        <Grid item xs={12} md={6} className={classes.desktopOnly}>
                            <ThemePreview theme={this.state.previewTheme}/>
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

    showResetSettingsDialog() {
        return (
            <Dialog
                open={this.state.resetSettingsDialog}
                onClose={() => this.toggleResetSettingsDialog()}
                >
                <DialogTitle id="alert-dialog-title">Are you sure you want to refresh settings?</DialogTitle>
                <DialogActions>
                <Button onClick={() => this.toggleResetSettingsDialog()} color="primary" autoFocus>
                    Cancel
                    </Button>
                    <Button onClick={() => {
                        this.refresh();
                    }} color="primary">
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
                <DialogTitle id="alert-dialog-title">Reset Hyperspace?</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to reset Hyperspace? You'll need to sign in again and grant Hyperspace access to use it again.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={() => this.toggleResetDialog()} color="primary" autoFocus>
                    Cancel
                    </Button>
                    <Button onClick={() => {
                        this.reset();
                    }} color="primary">
                    Reset
                    </Button>
                </DialogActions>
                </Dialog>
        );
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.pageLayoutConstraints}>
                <ListSubheader>Appearance</ListSubheader>
                <Paper className={classes.pageListConstraints}>
                    <List>
                        <ListItem>
                            <ListItemText primary="Dark mode"/>
                            <ListItemSecondaryAction>
                                <Switch checked={this.state.darkModeEnabled} onChange={this.toggleDarkMode}/>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Color scheme"/>
                            <ListItemSecondaryAction>
                                <Button onClick={this.toggleThemeDialog}>
                                    Set theme
                                </Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                </Paper>
                <br/>
                <ListSubheader>Notifications</ListSubheader>
                <Paper className={classes.pageListConstraints}>
                    <List>
                        <ListItem>
                            <ListItemText 
                                primary="Enable push notifications"
                                secondary={
                                    getUserDefaultBool('userDeniedNotification')?
                                        "Check your browser's notification permissions.":
                                            browserSupportsNotificationRequests()?
                                                "Send a push notification when not focused.":
                                                "Notifications aren't supported."
                                }
                            />
                            <ListItemSecondaryAction>
                                <Switch 
                                    checked={this.state.pushNotificationsEnabled} 
                                    onChange={this.togglePushNotifications}
                                    disabled={!browserSupportsNotificationRequests() || getUserDefaultBool('userDeniedNotification')}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        {
                            browserSupportsNotificationRequests()?
                            <ListItem>
                                <ListItemText 
                                    primary="Notification badge counts all notifications"
                                    secondary={
                                        "Counts all notifications, read or unread."
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <Switch 
                                        checked={this.state.badgeDisplaysAllNotifs} 
                                        onChange={this.toggleBadgeCount}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>: null
                        }
                    </List>
                </Paper>
                <br/>
                <ListSubheader>Accounts</ListSubheader>
                <Paper className={classes.pageListConstraints}>
                    <List>
                        <ListItem>
                            <ListItemText primary="Configure on Mastodon"/>
                            <ListItemSecondaryAction>
                                <IconButton href={(localStorage.getItem("baseurl") as string) + "/settings/preferences"} target="_blank" rel="noreferrer">
                                    <OpenInNewIcon/>
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                </Paper>
                <br/>
                <ListSubheader>Advanced</ListSubheader>
                <Paper className={classes.pageListConstraints}>
                    <List>
                        <ListItem>
                            <ListItemText primary="Refresh settings" secondary="Reset the settings to defaults."/>
                            <ListItemSecondaryAction>
                                <Button onClick={() => this.toggleResetSettingsDialog()}>
                                    Refresh
                                </Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Reset Hyperspace" secondary="Deletes all data and resets the app"/>
                            <ListItemSecondaryAction>
                                <Button onClick={() => this.toggleResetDialog()}>
                                    Reset
                                </Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                </Paper>
                {this.showThemeDialog()}
                {this.showResetDialog()}
                {this.showResetSettingsDialog()}
            </div>
        );
    }

}

export default withStyles(styles)(SettingsPage);