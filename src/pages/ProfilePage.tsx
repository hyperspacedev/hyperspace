import React, {Component} from 'react';
import {withStyles, Typography, Avatar, Divider, Button, CircularProgress, Paper, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from '@material-ui/core';
import {styles} from './PageLayout.styles';
import Mastodon from 'megalodon';
import { Account } from '../types/Account';
import { Status } from '../types/Status';
import { Relationship } from '../types/Relationship';
import Post from '../components/Post';
import {withSnackbar} from 'notistack';
import { LinkableButton } from '../interfaces/overrides';
import { emojifyString } from '../utilities/emojis';

interface IProfilePageState {
    account?: Account;
    relationship?: Relationship;
    posts?: [Status];
    viewIsLoading: boolean;
    viewDidLoad?: boolean;
    viewDidError?: boolean;
    viewDidErrorCode?: string;
    blockDialogOpen: boolean;
}

class ProfilePage extends Component<any, IProfilePageState> {

    client: Mastodon;

    constructor(props: any) {
        super(props);

        
        this.client = new Mastodon(localStorage.getItem('access_token') as string, localStorage.getItem('baseurl') + "/api/v1");

        this.state = {
            viewIsLoading: true,
            blockDialogOpen: false
        }
    }

    toggleBlockDialog() {
        if (this.state.relationship && !this.state.relationship.blocking)
            this.setState({ blockDialogOpen: !this.state.blockDialogOpen })
        else
            this.toggleBlock()
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
        this.getRelationships();
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

    getRelationships() {
        this.client.get("/accounts/relationships", {id: this.props.match.params.profileId }).then((resp: any) => {
            let relationship: Relationship = resp.data[0];
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
        if (this.state.posts && this.state.posts.length > 0) {
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
        } else {
            this.props.enqueueSnackbar("Reached end of posts", { variant: 'error'} );
            this.setState({
                viewIsLoading: false,
                viewDidLoad: true
            })
        }
    } 
    
    toggleFollow() {
        if (this.state.relationship) {
            if (this.state.relationship.following) {
                this.client.post(`/accounts/${this.state.account? this.state.account.id: this.props.match.params.profileId}/unfollow`).then((resp: any) => {
                    let relationship: Relationship = resp.data;
                    this.setState({ relationship });
                    this.props.enqueueSnackbar('You are no longer following this account.');
                }).catch((err: Error) => {
                    this.props.enqueueSnackbar("Couldn't unfollow account: " + err.name, { variant: 'error' });
                    console.error(err.message);
                })
            } else {
                this.client.post(`/accounts/${this.state.account? this.state.account.id: this.props.match.params.profileId}/follow`).then((resp: any) => {
                    let relationship: Relationship = resp.data;
                    this.setState({ relationship });
                    this.props.enqueueSnackbar('You are now following this account.');
                }).catch((err: Error) => {
                    this.props.enqueueSnackbar("Couldn't follow account: " + err.name, { variant: 'error' });
                    console.error(err.message);
                })
            }
        }
        
    }

    toggleBlock() {
        if (this.state.relationship) {
            if (this.state.relationship.blocking) {
                this.client.post(`/accounts/${this.state.account? this.state.account.id: this.props.match.params.profileId}/unblock`).then((resp: any) => {
                    let relationship: Relationship = resp.data;
                    this.setState({ relationship });
                    this.props.enqueueSnackbar('You are no longer blocking this account.');
                }).catch((err: Error) => {
                    this.props.enqueueSnackbar("Couldn't unblock account: " + err.name, { variant: 'error' });
                    console.error(err.message);
                })
            } else {
                this.client.post(`/accounts/${this.state.account? this.state.account.id: this.props.match.params.profileId}/block`).then((resp: any) => {
                    let relationship: Relationship = resp.data;
                    this.setState({ relationship });
                    this.props.enqueueSnackbar('You are now blocking this account.');
                }).catch((err: Error) => {
                    this.props.enqueueSnackbar("Couldn't block account: " + err.name, { variant: 'error' });
                    console.error(err.message);
                })
            }
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
                        <Typography variant="h4" color="inherit" dangerouslySetInnerHTML={{__html: this.state.account? emojifyString(this.state.account.display_name, this.state.account.emojis, classes.pageProfileNameEmoji): ""}}></Typography>
                        <Typography variant="caption" color="inherit">{this.state.account ? '@' + this.state.account.acct: ""}</Typography>
                        <Typography paragraph color="inherit">{this.state.account ? this.state.account.note: ""}</Typography>
                        <Divider/>
                        <div className={classes.pageProfileStatsDiv}>
                            {this.statElement(classes, 'followers')}
                            {this.statElement(classes, 'following')}
                            {this.statElement(classes, 'posts')}
                        </div>
                        <Divider/>
                        {
                            this.state.relationship?
                            <div>
                                <Button
                                    variant="contained" 
                                    color="primary" 
                                    className={classes.pageProfileFollowButton}
                                    onClick={() => this.toggleFollow()}
                                    disabled={this.state.account? this.state.account.id === JSON.parse(localStorage.getItem('account') as string).id: false}
                                >
                                    {this.state.relationship.following? "Unfollow": "Follow"}
                                </Button>
                                
                                <LinkableButton to={`/compose?mention=${this.state.account? this.state.account.acct: ""}`} variant="contained" className={classes.pageProfileFollowButton}>Mention</LinkableButton>
                                <Button 
                                    variant="contained" 
                                    className={classes.pageProfileFollowButton}
                                    disabled={this.state.account? this.state.account.id === JSON.parse(localStorage.getItem('account') as string).id: false}
                                    onClick={() => this.toggleBlockDialog()}
                                >
                                    {this.state.relationship.blocking? "Unblock": "Block"}
                                </Button>
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
                    <Dialog
                        open={this.state.blockDialogOpen}
                        onClose={() => this.toggleBlockDialog()}
                        >
                        <DialogTitle id="alert-dialog-title">Block this person?</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                Are you sure you want to block this person? You won't see their posts on your home feed, local timeline, or public timeline.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                        <Button onClick={() => this.toggleBlockDialog()} color="primary" autoFocus>
                            Cancel
                            </Button>
                            <Button onClick={() => {
                                this.toggleBlock();
                                this.toggleBlockDialog();
                            }} color="primary">
                            Block
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(withSnackbar(ProfilePage));