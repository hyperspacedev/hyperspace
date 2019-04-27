import React, {Component} from 'react';
import {withStyles, Typography, Paper, Avatar, Button, TextField, ListItem, ListItemText, ListItemAvatar, List, Grid} from '@material-ui/core';
import {withSnackbar, withSnackbarProps} from 'notistack';
import {styles} from './PageLayout.styles';
import { Account } from '../types/Account';
import Mastodon from 'megalodon';
import filedialog from 'file-dialog';

import PersonIcon from '@material-ui/icons/Person';

interface IYouProps extends withSnackbarProps {
    classes: any;
}

interface IYouState {
    currentAccount: Account;
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

    updateAvatar() {
        filedialog({
            multiple: false,
            accept: "image/*"
        }).then((images: FileList) => {
            if (images.length > 0) {
                this.props.enqueueSnackbar("Updating avatar...", { persist: true, key: "persistAvatar" });
                let upload = new FormData();
                upload.append("avatar", images[0]);
                this.client.patch("/accounts/update_credentials", upload).then((acct: any) => {
                    let currentAccount: Account = acct.data;
                    this.setState({ currentAccount });
                    localStorage.setItem("account", JSON.stringify(currentAccount));
                    this.props.closeSnackbar("persistAvatar");
                    this.props.enqueueSnackbar("Avatar updated successfully.");
                }).catch((err: Error) => {
                    this.props.closeSnackbar("persistAvatar");
                    this.props.enqueueSnackbar("Couldn't update avatar: " + err.name, { variant: "error" });
                })
            }
        }).catch((err: Error) => {
            this.props.enqueueSnackbar("Couldn't update avatar: " + err.name);
        })
    }

    updateHeader() {
        filedialog({
            multiple: false,
            accept: "image/*"
        }).then((images: FileList) => {
            if (images.length > 0) {
                this.props.enqueueSnackbar("Updating header...", { persist: true, key: "persistHeader" });
                let upload = new FormData();
                upload.append("header", images[0]);
                this.client.patch("/accounts/update_credentials", upload).then((acct: any) => {
                    let currentAccount: Account = acct.data;
                    this.setState({ currentAccount });
                    localStorage.setItem("account", JSON.stringify(currentAccount));
                    this.props.closeSnackbar("persistHeader");
                    this.props.enqueueSnackbar("Header updated successfully.");
                }).catch((err: Error) => {
                    this.props.closeSnackbar("persistHeader");
                    this.props.enqueueSnackbar("Couldn't update header: " + err.name, { variant: "error" });
                })
            }
        }).catch((err: Error) => {
            this.props.enqueueSnackbar("Couldn't update header: " + err.name);
        })
    }

    //TODO: Implement changeDisplayName
    changeDisplayName() {
        
    }

    //TODO: Implement changeBio
    changeBio() {

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
                            <Button className={classes.pageProfileFollowButton} variant="contained" onClick={() => this.updateAvatar()}>Change Avatar</Button>
                            <Button className={classes.pageProfileFollowButton} variant="contained" onClick={() => this.updateHeader()}>Change Header</Button>
                        </div>
                        <br/>
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