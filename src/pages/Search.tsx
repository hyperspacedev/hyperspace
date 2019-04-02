import React, { Component } from 'react';
import {
    List, 
    ListItem, 
    ListItemText, 
    ListSubheader, 
    ListItemSecondaryAction, 
    ListItemAvatar, 
    Avatar, 
    Paper, 
    IconButton, 
    withStyles, 
    Typography,
    Link,
    CircularProgress
} from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import DomainIcon from '@material-ui/icons/Domain';
import ChatIcon from '@material-ui/icons/Chat';
import PersonIcon from '@material-ui/icons/Person';
import {styles} from './PageLayout.styles';
import {LinkableIconButton} from '../interfaces/overrides';
import Mastodon from 'megalodon';
import {parse as parseParams, ParsedQuery} from 'query-string';
import { Results } from '../types/Search';
import { withSnackbar } from 'notistack';
import Post from '../components/Post';
import { Status } from '../types/Status';
import { Account } from '../types/Account';

interface ISearchPageState  {
    query: string[] | string;
    type?: string[] | string;
    results?: Results;
    viewIsLoading: boolean;
    viewDidLoad?: boolean;
    viewDidError?: boolean;
    viewDidErrorCode?: string;
}

class SearchPage extends Component<any, ISearchPageState> {

    client: Mastodon;

    constructor(props: any) {
        super(props);

        this.client = new Mastodon(localStorage.getItem('access_token') as string, localStorage.getItem('baseurl') + "/api/v2");

        let search = this.runQueryCheck();
        let query;
        let type;

        if (search.query) {
            query = search.query;
        } else {
            query = "";
        }

        if (search.type && search.type !== undefined) {
            type = search.type;
        }

        this.state = {
            viewIsLoading: true,
            query,
            type
        }
        this.searchQuery(query);
    }

    componentWillReceiveProps(props: any) {
        this.setState({ viewDidLoad: false, viewIsLoading: true, viewDidError: false, viewDidErrorCode: '', results: undefined});

        let newSearch = this.runQueryCheck(props.location);
        let query;
        let type;

        if (newSearch.query) {
            query = newSearch.query;
        } else {
            query = "";
        }

        if (newSearch.type && newSearch.type !== undefined) {
            type = newSearch.type;
        }

        this.setState({ query, type });
        this.searchQuery(query);
    }

    runQueryCheck(newLocation?: string): ParsedQuery {
        let searchParams = "";
        if (newLocation !== undefined && typeof(newLocation) === "string") {
            searchParams = newLocation.replace("#/search", "");
        } else {
            searchParams = location.hash.replace("#/search", "");
        }
        return parseParams(searchParams);
    }

    searchQuery(query: string | string[]) {
        this.client.get('/search', {q: query}).then((resp: any) => {
            let results: Results = resp.data;
            this.setState({ 
                results,
                viewDidLoad: true,
                viewIsLoading: false 
            });
        }).catch((err: Error) => {
            this.setState({
                viewIsLoading: false,
                viewDidError: true,
                viewDidErrorCode: err.message
            })

            this.props.enqueueSnackbar(`Couldn't search for ${this.state.query}: ${err.name}`, { variant: 'error' });
        });
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.pageLayoutConstraints}>
                <ListSubheader>Accounts</ListSubheader>
                <Paper className={classes.pageListConstraints}>
                    <List>
                        {
                            this.state.results?
                                this.state.results.accounts.map((acct: Account) => {
                                    return (
                                    <ListItem key={acct.id}>
                                        <ListItemAvatar>
                                            <Avatar alt={acct.username} src={acct.avatar_static}/>
                                        </ListItemAvatar>
                                        <ListItemText primary={acct.display_name || acct.acct} secondary={acct.acct}/>
                                        <ListItemSecondaryAction>
                                            <LinkableIconButton to={`/profile/${acct.id}`}>
                                                <PersonIcon/>
                                            </LinkableIconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    );
                                }): null
                        }
                    </List>
                </Paper>
                <br/>
                <ListSubheader>Posts</ListSubheader>
                {
                    this.state.results?
                        this.state.results.statuses.length > 0?
                            this.state.results.statuses.map((post: Status) => {
                                return <Post key={post.id} post={post} client={this.client}/>
                            }): <Typography variant="caption">No results found.</Typography>: null
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

export default withStyles(styles)(withSnackbar(SearchPage));