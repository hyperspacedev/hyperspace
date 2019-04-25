import React, {Component} from 'react';
import {withStyles, Typography, List, ListItem, Paper, ListItemText, Avatar, ListItemSecondaryAction, ListItemAvatar, ListSubheader, CircularProgress, IconButton, Divider, Tooltip} from '@material-ui/core';
import {styles} from './PageLayout.styles';
import Mastodon from 'megalodon';
import {Account} from '../types/Account';
import { LinkableIconButton, LinkableAvatar } from '../interfaces/overrides';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import {withSnackbar, withSnackbarProps} from 'notistack';

interface IRecommendationsPageProps extends withSnackbarProps {
    classes: any;
}

interface IRecommendationsPageState {
    viewIsLoading: boolean;
    viewDidLoad?: boolean;
    viewDidError?: Boolean;
    viewDidErrorCode?: string;
    requestedFollows?: [Account];
    followSuggestions?: [Account];
}

class RecommendationsPage extends Component<IRecommendationsPageProps, IRecommendationsPageState> {

    client: Mastodon;

    constructor(props: any) {
        super(props);
        this.client = new Mastodon(localStorage.getItem('access_token') as string, localStorage.getItem('baseurl') + "/api/v1");
        this.state = {
            viewIsLoading: true
        }
    }

    componentDidMount() {
        this.client.get('/follow_requests').then((resp: any) => {
            let requestedFollows: [Account] = resp.data;
            this.setState({ requestedFollows })
        }).catch((err: Error) => {
            this.setState({
                viewIsLoading: false,
                viewDidError: true,
                viewDidErrorCode: err.name
            });
            console.error(err.message);
        })

        this.client.get('/suggestions').then((resp: any) => {
            let followSuggestions: [Account] = resp.data;
            this.setState({
                viewIsLoading: false,
                viewDidLoad: true,
                followSuggestions
            })
        }).catch((err: Error) => {
            this.setState({
                viewIsLoading: false,
                viewDidError: true,
                viewDidErrorCode: err.name
            });
            console.error(err.message);
        })
    }

    followMember(acct: Account) {
        this.client.post(`/accounts/${acct.id}/follow`).then((resp: any) => {
            this.props.enqueueSnackbar('You are now following this account.');
            this.client.del(`/suggestions/${acct.id}`).then((resp: any) => {
                let followSuggestions = this.state.followSuggestions;
                if (followSuggestions) {
                    followSuggestions.forEach((suggestion: Account, index: number) => {
                        if (followSuggestions && suggestion.id === acct.id) {
                            followSuggestions.splice(index, 1);
                        }
                    });
                    this.setState({ followSuggestions });
                }
            })
        }).catch((err: Error) => {
            this.props.enqueueSnackbar("Couldn't follow account: " + err.name, { variant: 'error' });
            console.error(err.message);
        })
    }

    handleFollowRequest(acct: Account, type: "authorize" | "reject") {
        this.client.post(`/follow_requests/${acct.id}/${type}`).then((resp: any) => {

            let requestedFollows = this.state.requestedFollows;
            if (requestedFollows) {
                requestedFollows.forEach((request: Account, index: number) => {
                    if (requestedFollows && request.id === acct.id) {
                        requestedFollows.splice(index, 1);
                    };
                });
            };
            this.setState({requestedFollows});

            let verb: string = type;
            verb === "authorize"? verb = "authorized": verb = "rejected";
            this.props.enqueueSnackbar(`You have ${verb} this request.`);
        }).catch((err: Error) => {
            this.props.enqueueSnackbar(`Couldn't ${type} this request: ${err.name}`, { variant: 'error' });
            console.error(err.message);
        })
    }

    showFollowRequests() {
        const {classes} = this.props;
        return (
            <div>
                <ListSubheader>Follow requests</ListSubheader>
                    <Paper className={classes.pageListConstraints}>
                        <List>
                            {
                                this.state.requestedFollows?
                                    this.state.requestedFollows.map((request: Account) => {
                                        return (
                                        <ListItem key={request.id}>
                                            <ListItemAvatar>
                                                <LinkableAvatar to={`/profile/${request.id}`} alt={request.username} src={request.avatar_static}/>
                                            </ListItemAvatar>
                                            <ListItemText primary={request.display_name || request.acct} secondary={request.acct}/>
                                            <ListItemSecondaryAction>
                                                <Tooltip title="Accept request">
                                                    <IconButton onClick={() => this.handleFollowRequest(request, "authorize")}>
                                                        <CheckIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Reject request">
                                                    <IconButton onClick={() => this.handleFollowRequest(request, "reject")}>
                                                        <CloseIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="View profile">
                                                    <LinkableIconButton to={`/profile/${request.id}`}>
                                                        <AccountCircleIcon/>
                                                    </LinkableIconButton>
                                                </Tooltip>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    );
                                    }): null
                            }
                        </List>
                    </Paper>
                <br/>
            </div>
        )
    }

    showFollowSuggestions() {
        const {classes} = this.props;
        return (
            <div>
                <ListSubheader>Suggested accounts</ListSubheader>
                    <Paper className={classes.pageListConstraints}>
                        <List>
                            {
                                this.state.followSuggestions?
                                    this.state.followSuggestions.map((suggestion: Account) => {
                                        return (
                                        <ListItem key={suggestion.id}>
                                            <ListItemAvatar>
                                                <LinkableAvatar to={`/profile/${suggestion.id}`} alt={suggestion.username} src={suggestion.avatar_static}/>
                                            </ListItemAvatar>
                                            <ListItemText primary={suggestion.display_name || suggestion.acct} secondary={suggestion.acct}/>
                                            <ListItemSecondaryAction>
                                                <Tooltip title="View profile">
                                                    <LinkableIconButton to={`/profile/${suggestion.id}`}>
                                                        <AssignmentIndIcon/>
                                                    </LinkableIconButton>
                                                </Tooltip>
                                                <Tooltip title="Follow">
                                                    <IconButton onClick={() => this.followMember(suggestion)}>
                                                        <PersonAddIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    );
                                    }): null
                            }
                        </List>
                    </Paper>
                <br/>
            </div>
        )
    }

    render() {
        const {classes} = this.props;
        return (
            <div className={classes.pageLayoutConstraints}>
                {
                    this.state.viewDidLoad?
                        <div>
                            {
                                this.state.requestedFollows && this.state.requestedFollows.length > 0?
                                this.showFollowRequests():
                                <div>
                                    <Typography variant="h6">You don't have any follow requests.</Typography>
                                    <br/>
                                </div>
                            }
                            <Divider/>
                            <br/>
                            {
                                this.state.followSuggestions && this.state.followSuggestions.length > 0? this.showFollowSuggestions(): 
                                <div>
                                    <Typography variant="h5">We don't have any suggestions for you.</Typography>
                                    <Typography paragraph>Why not interact with the fediverse a bit by creating a new post?</Typography>
                                </div>
                            }
                        </div>: null
                }
                {
                    this.state.viewDidError? 
                        <Paper className={classes.errorCard}>
                            <Typography variant="h4">Bummer.</Typography>
                            <Typography variant="h6">Something went wrong when loading this timeline.</Typography>
                            <Typography>{this.state.viewDidErrorCode? this.state.viewDidErrorCode: ""}</Typography>
                        </Paper>: 
                        <span/>
                }
                {
                    this.state.viewIsLoading?
                    <div style={{ textAlign: 'center' }}><CircularProgress className={classes.progress} color="primary" /></div>:
                    <span/>
                }
            </div>
        );
    }
}

export default withStyles(styles)(withSnackbar(RecommendationsPage));