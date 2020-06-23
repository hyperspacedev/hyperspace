import React, { Component } from "react";
import {
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    ListItemSecondaryAction,
    ListItemAvatar,
    Paper,
    withStyles,
    Typography,
    CircularProgress,
    Tooltip,
    IconButton
} from "@material-ui/core";

import AssignmentIndIcon from "@material-ui/icons/AssignmentInd";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import { styles } from "./PageLayout.styles";
import { LinkableIconButton, LinkableAvatar } from "../interfaces/overrides";
import Mastodon from "megalodon";
import { parse as parseParams } from "query-string";
import { Results } from "../types/Search";
import { withSnackbar } from "notistack";
import Post from "../components/Post";
import { Status } from "../types/Status";
import { Account } from "../types/Account";
import Masonry from "react-masonry-css";
import { getUserDefaultBool } from "../utilities/settings";

interface ISearchPageState {
    query: string[] | string;
    type?: string[] | string;
    results?: Results;
    tagResults?: [Status];
    viewIsLoading: boolean;
    viewDidLoad?: boolean;
    viewDidError?: boolean;
    viewDidErrorCode?: string;
    isMasonryLayout: boolean;
}

class SearchPage extends Component<any, ISearchPageState> {
    client: Mastodon;

    constructor(props: any) {
        super(props);

        this.client = new Mastodon(
            localStorage.getItem("access_token") as string,
            localStorage.getItem("baseurl") + "/api/v2"
        );

        let searchParams = this.getQueryAndType(props);

        this.state = {
            viewIsLoading: true,
            query: searchParams.query,
            type: searchParams.type,
            isMasonryLayout: getUserDefaultBool("isMasonryLayout")
        };

        if (searchParams.type === "tag") {
            this.searchForPostsWithTags(searchParams.query);
        } else {
            this.searchQuery(searchParams.query);
        }
    }

    componentWillReceiveProps(props: any) {
        this.setState({
            viewDidLoad: false,
            viewIsLoading: true,
            viewDidError: false,
            viewDidErrorCode: "",
            results: undefined
        });
        let searchParams = this.getQueryAndType(props);
        this.setState({ query: searchParams.query, type: searchParams.type });
        if (searchParams.type === "tag") {
            this.searchForPostsWithTags(searchParams.query);
        } else {
            this.searchQuery(searchParams.query);
        }
    }

    getQueryAndType(props: any) {
        const { search }: { search: string } = props.location;
        let newSearch = parseParams(search);
        let query: string | string[] = "";
        let type;

        if (newSearch.query) {
            if (search.includes("tag:")) {
                type = "tag";
            }
            query = newSearch.query.toString().replace("tag:", "");
        }

        if (newSearch.type && newSearch.type !== undefined) {
            type = newSearch.type;
        }

        return {
            query: query,
            type: type
        };
    }

    searchQuery(query: string | string[]) {
        this.client
            .get("/search", { q: query })
            .then((resp: any) => {
                let results: Results = resp.data;
                this.setState({
                    results,
                    viewDidLoad: true,
                    viewIsLoading: false
                });
            })
            .catch((err: Error) => {
                this.setState({
                    viewIsLoading: false,
                    viewDidError: true,
                    viewDidErrorCode: err.message
                });

                this.props.enqueueSnackbar(
                    `Couldn't search for ${this.state.query}: ${err.name}`,
                    { variant: "error" }
                );
            });
    }

    searchForPostsWithTags(query: string | string[]) {
        let client = new Mastodon(
            localStorage.getItem("access_token") as string,
            localStorage.getItem("baseurl") + "/api/v1"
        );
        client
            .get(`/timelines/tag/${query}`)
            .then((resp: any) => {
                let tagResults: [Status] = resp.data;
                this.setState({
                    tagResults,
                    viewDidLoad: true
                });
            })
            .catch((err: Error) => {
                this.setState({
                    viewDidError: true,
                    viewDidErrorCode: err.message
                });

                this.props.enqueueSnackbar(
                    `Couldn't search for posts with tag ${this.state.query}: ${err.name}`,
                    { variant: "error" }
                );
            })
            .finally(() => {
                this.setState({ viewIsLoading: false });
            });
    }

    followMemberFromQuery(acct: Account) {
        let client = new Mastodon(
            localStorage.getItem("access_token") as string,
            localStorage.getItem("baseurl") + "/api/v1"
        );
        client
            .post(`/accounts/${acct.id}/follow`)
            .then((resp: any) => {
                this.props.enqueueSnackbar(
                    "You are now following this account."
                );
            })
            .catch((err: Error) => {
                this.props.enqueueSnackbar(
                    "Couldn't follow account: " + err.name,
                    { variant: "error" }
                );
                console.error(err.message);
            });
    }

    showAllAccountsFromQuery() {
        const { classes } = this.props;
        return (
            <div className={classes.pageLayoutConstraints}>
                <ListSubheader>Accounts</ListSubheader>

                {this.state.results &&
                this.state.results.accounts.length > 0 ? (
                    <Paper className={classes.pageListConstraints}>
                        <List>
                            {this.state.results.accounts.map(
                                (acct: Account) => {
                                    return (
                                        <ListItem key={acct.id}>
                                            <ListItemAvatar>
                                                <LinkableAvatar
                                                    to={`/profile/${acct.id}`}
                                                    alt={acct.username}
                                                    src={acct.avatar_static}
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    acct.display_name ||
                                                    acct.acct
                                                }
                                                secondary={acct.acct}
                                            />
                                            <ListItemSecondaryAction>
                                                <Tooltip title="View profile">
                                                    <LinkableIconButton
                                                        to={`/profile/${acct.id}`}
                                                    >
                                                        <AssignmentIndIcon />
                                                    </LinkableIconButton>
                                                </Tooltip>
                                                <Tooltip title="Follow">
                                                    <IconButton
                                                        onClick={() =>
                                                            this.followMemberFromQuery(
                                                                acct
                                                            )
                                                        }
                                                    >
                                                        <PersonAddIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    );
                                }
                            )}
                        </List>
                    </Paper>
                ) : (
                    <Typography
                        variant="caption"
                        className={classes.pageLayoutEmptyTextConstraints}
                    >
                        No results found
                    </Typography>
                )}

                <br />
            </div>
        );
    }

    renderPosts(posts: Status[]) {
        const { classes } = this.props;
        const postComponents = posts.map((post: Status) => {
            return <Post key={post.id} post={post} client={this.client} />;
        });
        if (this.state.isMasonryLayout) {
            return (
                <Masonry
                    className={classes.masonryGrid}
                    columnClassName={classes["my-masonry-grid_column"]}
                    breakpointCols={{
                        default: 4,
                        2000: 3,
                        1400: 2,
                        1050: 1
                    }}
                >
                    {postComponents}
                </Masonry>
            );
        } else {
            return <div>{postComponents}</div>;
        }
    }

    showAllPostsFromQuery() {
        const { classes } = this.props;
        const containerClasses = `${classes.pageLayoutConstraints} ${
            this.state.isMasonryLayout
                ? classes.pageLayoutMasonry + " " + classes.noTopPaddingMargin
                : ""
        }`;
        return (
            <div className={containerClasses}>
                <ListSubheader>Posts</ListSubheader>
                {this.state.results ? (
                    this.state.results.statuses.length > 0 ? (
                        this.renderPosts(this.state.results.statuses)
                    ) : (
                        <Typography
                            variant="caption"
                            className={classes.pageLayoutEmptyTextConstraints}
                        >
                            No results found.
                        </Typography>
                    )
                ) : null}
            </div>
        );
    }

    showAllPostsWithTag() {
        const { classes } = this.props;
        const containerClasses = `${classes.pageLayoutMaxConstraints} ${
            this.state.isMasonryLayout ? classes.pageLayoutMasonry : ""
        }`;
        return (
            <div className={containerClasses}>
                <ListSubheader>Tagged posts</ListSubheader>
                {this.state.tagResults ? (
                    this.state.tagResults.length > 0 ? (
                        this.renderPosts(this.state.tagResults)
                    ) : (
                        <Typography
                            variant="caption"
                            className={classes.pageLayoutEmptyTextConstraints}
                        >
                            No results found.
                        </Typography>
                    )
                ) : null}
            </div>
        );
    }

    render() {
        const { classes } = this.props;
        return (
            <div>
                {this.state.type && this.state.type === "tag" ? (
                    this.showAllPostsWithTag()
                ) : (
                    <div>
                        {this.showAllAccountsFromQuery()}
                        {this.showAllPostsFromQuery()}
                    </div>
                )}
                {this.state.viewDidError ? (
                    <Paper className={classes.errorCard}>
                        <Typography variant="h4">Bummer.</Typography>
                        <Typography variant="h6">
                            Something went wrong when loading this timeline.
                        </Typography>
                        <Typography>
                            {this.state.viewDidErrorCode
                                ? this.state.viewDidErrorCode
                                : ""}
                        </Typography>
                    </Paper>
                ) : (
                    <span />
                )}
                {this.state.viewIsLoading ? (
                    <div style={{ textAlign: "center" }}>
                        <CircularProgress
                            className={classes.progress}
                            color="primary"
                        />
                    </div>
                ) : (
                    <span />
                )}
            </div>
        );
    }
}

export default withStyles(styles)(withSnackbar(SearchPage));
