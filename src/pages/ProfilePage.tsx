import React, {Component} from 'react';
import {withStyles, Typography, Avatar, Divider, Button} from '@material-ui/core';
import {styles} from './PageLayout.styles';
import Mastodon from 'megalodon';
import { Account } from '../types/Account';

interface IProfilePageState {
    id: string;
    display_name: string;
    acct: string;
    followers_count: number;
    following_count: number;
    status_count: number;
    statuses: [];
    avatar: string;
    header: string;
    note: string;
}

class ProfilePage extends Component<any, IProfilePageState> {

    constructor(props: any) {
        super(props);

        const { match: { params }} = this.props;
        
        let client = new Mastodon(localStorage.getItem('account_token') as string, localStorage.getItem('baseurl') + "/api/v1");
        client.get(`/accounts/${params.profileId}`).then((resp: any) => {
            let profile: Account = resp.data;

            const div = document.createElement('div');
            div.innerHTML = profile.note;
            const note = div.textContent || div.innerText || "";

            this.setState({
                id: profile.id,
                display_name: profile.display_name,
                acct: '@' + profile.acct,
                followers_count: profile.followers_count,
                following_count: profile.following_count,
                status_count: profile.statuses_count,
                avatar: profile.avatar_static,
                header: profile.header_static,
                note: note
            })
        })
    }

    statElement(classes: any, stat: 'following' | 'followers' | 'posts') {
        let number = 0;
        if (this.state) {
            if (stat == 'following') {
                number = this.state.following_count;
            } else if (stat == 'followers') {
                number = this.state.followers_count;
            } else if (stat == 'posts') {
                number = this.state.status_count;
            }
        }
        return <div className={classes.pageProfileStat}>
            <Typography variant="h6" color="inherit">{number}</Typography>
            <Typography color="inherit">{stat}</Typography>
        </div>;
    }

    render() {
        const { classes } = this.props;

        return(
            <div className={classes.pageLayoutMinimalConstraints}>
                <div className={classes.pageHeroBackground}>
                    <div className={classes.pageHeroBackgroundImage} style={{ backgroundImage: this.state? `url("${this.state.header}")`: `url("")`}}/>
                    <div className={classes.pageHeroContent}>
                        <Avatar className={classes.pageProfileAvatar} src={this.state ? this.state.avatar: ""}/>
                        <Typography variant="h4" color="inherit">{this.state? this.state.display_name: ""}</Typography>
                        <Typography variant="caption" color="inherit">{this.state? this.state.acct: ""}</Typography>
                        <Typography paragraph color="inherit">{this.state? this.state.note: ""}</Typography>
                        <Divider/>
                        <div className={classes.pageProfileStatsDiv}>
                            {this.statElement(classes, 'followers')}
                            {this.statElement(classes, 'following')}
                            {this.statElement(classes, 'posts')}
                        </div>
                        <Divider/>
                        <Button variant="contained" color="primary" className={classes.pageProfileFollowButton}>Follow</Button>
                        <Button variant="contained" className={classes.pageProfileFollowButton}>Mention</Button>
                        <Button variant="contained" className={classes.pageProfileFollowButton}>Block</Button>
                    </div>
                </div>
                <div className={classes.pageContentLayoutConstraints}>
                    <Typography variant="h6">Looks like no one's posted here yet.</Typography>
                    <Typography>Why not give a nidge to start the conversation?</Typography>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(ProfilePage)