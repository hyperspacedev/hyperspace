import React, {Component} from 'react';
import {withStyles, Typography, Paper, Avatar, Button, TextField, ListItem, ListItemText, ListItemAvatar, List, Grid} from '@material-ui/core';
import {withSnackbar, withSnackbarProps} from 'notistack';
import {styles} from './PageLayout.styles';
import { Account } from '../types/Account';
import Mastodon from 'megalodon';

import PersonIcon from '@material-ui/icons/Person';

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
            <div className={classes.pageLayoutMinimalConstraints}>
                <div className={classes.pageHeroBackground}>
                    <div className={classes.pageHeroBackgroundImage} style={{ backgroundImage: `url("${this.state.currentAccount.header_static}")`}}/>
                    <div className={classes.pageHeroContent}>
                        <Avatar className={classes.pageProfileAvatar} src={this.state.currentAccount.avatar_static}/>
                        <Typography variant="h4" color="inherit" component="h1">Edit your profile</Typography>
                        <br/>
                        <div>
                            <Button className={classes.pageProfileFollowButton} variant="contained">Edit Avatar</Button>
                            <Button className={classes.pageProfileFollowButton} variant="contained">Edit Header</Button>
                        </div>
                    </div>
                </div>
                <div className={classes.pageContentLayoutConstraints}>
                    <Paper className={classes.youPaper}>
                        <Typography variant="h5" component="h2">Display name</Typography>
                    </Paper>
                    <br/>
                    <Paper className={classes.youPaper}>
                        <Typography variant="h5" component="h2">About you</Typography>
                    </Paper>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(withSnackbar(You));