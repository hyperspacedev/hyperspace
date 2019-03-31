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
    DialogActions
} from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import {styles} from './PageLayout.styles';
import {setUserDefaultBool, getUserDefaultBool, getUserDefaultTheme, setUserDefaultTheme} from '../utilities/settings';
import {canSendNotifications, browserSupportsNotificationRequests} from '../utilities/notifications';
import {themes} from '../types/HyperspaceTheme';

interface ISettingsState {
    darkModeEnabled: boolean;
    pushNotificationsEnabled: boolean;
    selectThemeName: string;
    themeDialogOpen: boolean;
}

class SettingsPage extends Component<any, ISettingsState> {

    constructor(props: any) {
        super(props);

        this.state = {
            darkModeEnabled: getUserDefaultBool('darkModeEnabled'),
            pushNotificationsEnabled: canSendNotifications(),
            selectThemeName: getUserDefaultTheme().key,
            themeDialogOpen: false
        }

        this.toggleDarkMode = this.toggleDarkMode.bind(this);
        this.togglePushNotifications = this.togglePushNotifications.bind(this);
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

    toggleThemeDialog() {
        this.setState({ themeDialogOpen: !this.state.themeDialogOpen });
    }

    changeTheme() {
        setUserDefaultTheme(this.state.selectThemeName);
        window.location.reload();
    }

    changeThemeName(theme: string) {
        this.setState({ selectThemeName: theme});
    }

    showThemeDialog() {
        return (
            <Dialog
                open={this.state.themeDialogOpen}
                disableBackdropClick
                disableEscapeKeyDown
                maxWidth="sm"
                fullWidth={true}
                aria-labelledby="confirmation-dialog-title"
            >
                <DialogTitle id="confirmation-dialog-title">Choose a color scheme</DialogTitle>
                <DialogContent>
                    <RadioGroup
                        aria-label="Color Scheme"
                        name="ringtone"
                        value={this.state.selectThemeName}
                        onChange={(e, value) => this.changeThemeName(value)}
                    >
                        {themes.map(theme => (
                            <FormControlLabel value={theme.key} key={theme.key} control={<Radio />} label={theme.name} />
                        ))}
                        ))}
                    </RadioGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.toggleThemeDialog} color="default">
                        Cancel
                    </Button>
                    <Button onClick={this.changeTheme} color="secondary">
                        Ok
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
                                    browserSupportsNotificationRequests()?
                                    "":
                                    "Notifications aren't supported in this browser."
                                }
                            />
                            <ListItemSecondaryAction>
                                <Switch 
                                    checked={this.state.pushNotificationsEnabled} 
                                    onChange={this.togglePushNotifications}
                                    disabled={!browserSupportsNotificationRequests()}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                </Paper>
                <br/>
                <ListSubheader>Accounts</ListSubheader>
                <Paper className={classes.pageListConstraints}>
                    <List>
                        <ListItem>
                            <ListItemText primary="Configure on Mastodon" secondary="Configure your account settings on Mastodon"/>
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
                            <ListItemText primary="Reset Hyperspace" secondary="Deletes all data and resets the app"/>
                            <ListItemSecondaryAction>
                                <Button>
                                    Reset
                                </Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                </Paper>
                {this.showThemeDialog()}
            </div>
        );
    }

}

export default withStyles(styles)(SettingsPage);