import React, {Component} from 'react';
import {withStyles, Typography, Paper, Avatar, Button, TextField, ListItem, ListItemText, ListItemAvatar, List, Grid} from '@material-ui/core';
import {withSnackbar, withSnackbarProps} from 'notistack';
import {styles} from './PageLayout.styles';
import { Account } from '../types/Account';
import Mastodon from 'megalodon';

interface IYouProps extends withSnackbarProps {
    classes: any;
}

interface IYouState {
    currentAccount: Account;
    newProfile?: any;
    newHeader?: any;
    newDisplayName?: string;
    newBio?: string;
}

class You extends Component<IYouProps, IYouState> {

    client: Mastodon;

    constructor(props: any) {
        super(props);

        this.client = new Mastodon(localStorage.getItem('access_token') as string, localStorage.getItem('baseurl') as string + "/api/v1");

        this.state = {
            currentAccount: this.getAccount()
        }
    }

    getAccount() {
        let acct = localStorage.getItem('account');
        if (acct) {
          return JSON.parse(acct);
        }
    }

    render() {
        const {classes} = this.props;
        return (
            <div className={classes.pageLayoutConstraints}>
                <div className={classes.pageListConstraints}>
                    <Paper>
                        <List>
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar className={classes.youHeadingAvatar} src={this.state.currentAccount.avatar_static} alt={this.state.currentAccount.acct}/>
                                </ListItemAvatar>
                                <ListItemText primary={
                                    <Typography variant="h5" component="h1"><b>{this.state.currentAccount.display_name || this.state.currentAccount.username} (you)</b></Typography>
                                } secondary={<Typography variant="h6" color="textSecondary" component="p">{"@" + this.state.currentAccount.acct}</Typography>}/>
                            </ListItem>
                        </List>
                    </Paper>
                    <br/>
                    <Paper className={classes.youPaper}>
                        <Typography variant="h6" component="h2">Update your profile images</Typography>
                        <br/>
                        <Grid container spacing={16}>
                            <Grid xs={12} md={6}>
                                <Typography>Wut</Typography>
                            </Grid>
                            <Grid xs={12} md={6}>
                                <Typography>Wut</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                    <br/>
                    <Paper className={classes.youPaper}>
                        <Typography variant="h6" component="h2">Change your display name</Typography>
                    </Paper>
                    <br/>
                    <Paper className={classes.youPaper}>
                        <Typography variant="h6" component="h2">Edit your bio</Typography>
                    </Paper>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(withSnackbar(You));