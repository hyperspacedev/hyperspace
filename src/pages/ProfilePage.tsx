import React, {Component} from 'react';
import {withStyles, Typography, Avatar, Divider, Button, CircularProgress, Paper} from '@material-ui/core';
import {styles} from './PageLayout.styles';
import Mastodon from 'megalodon';
import { Account } from '../types/Account';
import { Status } from '../types/Status';
import { Relationship } from '../types/Relationship';
import Post from '../components/Post';
import {withSnackbar} from 'notistack';
import { LinkableButton } from '../interfaces/overrides';

interface IProfilePageState {
    account?: Account;
    relationship?: Relationship;
    posts?: [Status];
    viewIsLoading: boolean;
    viewDidLoad?: boolean;
    viewDidError?: boolean;
    viewDidErrorCode?: string;
}

class ProfilePage extends Component<any, IProfilePageState> {

    client: Mastodon;

    constructor(props: any) {
        super(props);

        
        this.client = new Mastodon(localStorage.getItem('access_token') as string, localStorage.getItem('baseurl') + "/api/v1");

        this.state = {
            viewIsLoading: true
        }
    }

    getAccountData(id: string) {
        this.client.get(`/accounts/${id}`).then((resp: any) => {
            let profile: Account = resp.data;

            const div = document.createElement('div');
            div.innerHTML = profile.note;
            profile.note = div.textContent || div.innerText || "";

            this.setState({
                account: profile
            })
        }).catch((error: Error) => {
            this.setState({
                viewIsLoading: false,
                viewDidError: true,
                viewDidErrorCode: error.message
            })
        });
        this.client.get(`/accounts/${id}/statuses`).then((resp: any) => {
            this.setState({
                posts: resp.data,
                viewIsLoading: false,
                viewDidLoad: true,
                viewDidError: false
            })
        }).catch( (err: Error) => {
            this.setState({
                viewIsLoading: false,
                viewDidError: true,
                viewDidErrorCode: err.message
            })
        });
    }

    componentWillReceiveProps(props: any) {
        this.getAccountData(props.match.params.profileId);
        window.scrollTo(0, 0);
    }

    componentWillMount() {
        const { match: { params }} = this.props;
        this.getAccountData(params.profileId);
    }

    componentDidMount() {
        this.client.get("/accounts/relationships", {id: [this.props.match.params.profileId]}).then((resp: any) => {
            let relationship: Relationship = resp.data;
            this.setState({ relationship });
        }).catch((error: Error) => {
            this.setState({
                viewIsLoading: false,
                viewDidError: true,
                viewDidErrorCode: error.message
            })
        });
    }

    statElement(classes: any, stat: 'following' | 'followers' | 'posts') {
        let number = 0;
        if (this.state.account) {
            if (stat == 'following') {
                number = this.state.account.following_count;
            } else if (stat == 'followers') {
                number = this.state.account.followers_count;
            } else if (stat == 'posts') {
                number = this.state.account.statuses_count;
            }
        }
        return <div className={classes.pageProfileStat}>
            <Typography variant="h6" color="inherit">{number}</Typography>
            <Typography color="inherit">{stat}</Typography>
        </div>;
    }

    loadMoreTimelinePieces() {
        const { match: {params}} = this.props;
        this.setState({ viewDidLoad: false, viewIsLoading: true})
        if (this.state.posts) {
            this.client.get(`/accounts/${params.profileId}/statuses`, { max_id: this.state.posts[this.state.posts.length - 1].id, limit: 20 }).then((resp: any) => {
                let newPosts: [Status] = resp.data;
                let posts = this.state.posts as [Status];
                if (newPosts.length <= 0) {
                    this.props.enqueueSnackbar("Reached end of posts", {
                        variant: 'error'
                    });
                } else {
                    newPosts.forEach((post: Status) => {
                        posts.push(post);
                    });
                }
                this.setState({
                    viewIsLoading: false,
                    viewDidLoad: true,
                    posts
                })
            }).catch((err: Error) => {
                this.setState({
                    viewIsLoading: false,
                    viewDidError: true,
                    viewDidErrorCode: err.message
                })
                this.props.enqueueSnackbar("Failed to get posts", { 
                    variant: 'error',
                });
            })
        }
    }

    render() {
        const { classes } = this.props;
        return(
            <div className={classes.pageLayoutMinimalConstraints}>
                <div className={classes.pageHeroBackground}>
                    <div className={classes.pageHeroBackgroundImage} style={{ backgroundImage: this.state.account? `url("${this.state.account.header}")`: `url("")`}}/>
                    <div className={classes.pageHeroContent}>
                        <Avatar className={classes.pageProfileAvatar} src={this.state.account ? this.state.account.avatar: ""}/>
                        <Typography variant="h4" color="inherit">{this.state.account ? this.state.account.display_name: ""}</Typography>
                        <Typography variant="caption" color="inherit">{this.state.account ? this.state.account.acct: ""}</Typography>
                        <Typography paragraph color="inherit">{this.state.account ? this.state.account.note: ""}</Typography>
                        <Divider/>
                        <div className={classes.pageProfileStatsDiv}>
                            {this.statElement(classes, 'followers')}
                            {this.statElement(classes, 'following')}
                            {this.statElement(classes, 'posts')}
                        </div>
                        <Divider/>
                        {
                            this.state.account && this.state.relationship?
                            <div>
                                <Button variant="contained" color="primary" className={classes.pageProfileFollowButton}>{this.state.relationship? "Unfollow": "Follow"}</Button>
                                <LinkableButton to={`/compose?mention=${this.state.account.acct}`} variant="contained" className={classes.pageProfileFollowButton}>Mention</LinkableButton>
                                <Button variant="contained" className={classes.pageProfileFollowButton}>{this.state.relationship.blocking? "Unblock": "Block"}</Button>
                            </div>: null
                        }
                    </div>
                </div>
                <div className={classes.pageContentLayoutConstraints}>
                    {
                        this.state.viewDidError? 
                            <Paper className={classes.errorCard}>
                                <Typography variant="h4">Bummer.</Typography>
                                <Typography variant="h6">Something went wrong when loading this profile.</Typography>
                                <Typography>{this.state.viewDidErrorCode? this.state.viewDidErrorCode: ""}</Typography>
                            </Paper>: 
                            <span/>
                    }
                    {
                        this.state.posts?
                        <div>
                            {
                                this.state.posts.map((post: Status) => {
                                    return <Post key={post.id} post={post} client={this.client}/>;
                                })
                            }
                            <br/>
                            {
                                this.state.viewDidLoad && !this.state.viewDidError? <div style={{textAlign: "center"}} onClick={() => this.loadMoreTimelinePieces()}><Button variant="contained">Load more</Button></div>: null
                            }
                        </div>: <span/>
                    }
                                        {
                        this.state.viewIsLoading?
                        <div style={{ textAlign: 'center' }}><CircularProgress className={classes.progress} color="primary" /></div>:
                        <span/>
                    }
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(withSnackbar(ProfilePage));