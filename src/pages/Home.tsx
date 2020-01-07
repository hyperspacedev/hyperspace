import React, { Component } from "react";
import {
    withStyles,
    CircularProgress,
    Typography,
    Paper,
    Button,
    Chip,
    Avatar,
    Slide
} from "@material-ui/core";
import { styles } from "./PageLayout.styles";
import Post from "../components/Post";
import { Status } from "../types/Status";
import Mastodon, { StreamListener } from "megalodon";
import { withSnackbar } from "notistack";
import Masonry from "react-masonry-css";
import { getUserDefaultBool } from "../utilities/settings";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";

interface IHomePageState {
    posts?: [Status];
    backlogPosts?: [Status] | null;
    viewIsLoading: boolean;
    viewDidLoad?: boolean;
    viewDidError?: boolean;
    viewDidErrorCode?: any;
    isMasonryLayout?: boolean;
}

/**
 * The base class for the home timeline.
 * @deprecated Use TimelinePage with the props `timeline="/timelines/home"`
 * and `stream="/streaming/user"`.
 */
class HomePage extends Component<any, IHomePageState> {
    client: Mastodon;
    streamListener: StreamListener;

    constructor(props: any) {
        super(props);

        this.state = {
            viewIsLoading: true,
            backlogPosts: null,
            isMasonryLayout: getUserDefaultBool("isMasonryLayout")
        };

        this.client = new Mastodon(
            localStorage.getItem("access_token") as string,
            (localStorage.getItem("baseurl") as string) + "/api/v1"
        );
        this.streamListener = this.client.stream("/streaming/user");
    }

    componentWillMount() {
        this.streamListener.on("connect", () => {
            this.client
                .get("/timelines/home", { limit: 40 })
                .then((resp: any) => {
                    let statuses: [Status] = resp.data;
                    this.setState({
                        posts: statuses,
                        viewIsLoading: false,
                        viewDidLoad: true,
                        viewDidError: false
                    });
                })
                .catch((resp: any) => {
                    this.setState({
                        viewIsLoading: false,
                        viewDidLoad: true,
                        viewDidError: true,
                        viewDidErrorCode: String(resp)
                    });
                    this.props.enqueueSnackbar("Failed to get posts.", {
                        variant: "error"
                    });
                });
        });

        this.streamListener.on("update", (status: Status) => {
            let queue = this.state.backlogPosts;
            if (queue !== null && queue !== undefined) {
                queue.unshift(status);
            } else {
                queue = [status];
            }
            this.setState({ backlogPosts: queue });
        });

        this.streamListener.on("delete", (id: number) => {
            let posts = this.state.posts;
            if (posts) {
                posts.forEach((post: Status) => {
                    if (posts && parseInt(post.id) === id) {
                        posts.splice(posts.indexOf(post), 1);
                    }
                });
                this.setState({ posts });
            }
        });

        this.streamListener.on("error", (err: Error) => {
            this.setState({
                viewDidError: true,
                viewDidErrorCode: err.message
            });
            this.props.enqueueSnackbar("An error occured.", {
                variant: "error"
            });
        });

        this.streamListener.on("heartbeat", () => {});
    }

    componentWillUnmount() {
        this.streamListener.stop();
    }

    insertBacklog() {
        window.scrollTo(0, 0);
        let posts = this.state.posts;
        let backlog = this.state.backlogPosts;
        if (posts && backlog && backlog.length > 0) {
            let push = backlog.concat(posts);
            this.setState({ posts: push as [Status], backlogPosts: null });
        }
    }

    loadMoreTimelinePieces() {
        this.setState({ viewDidLoad: false, viewIsLoading: true });
        if (this.state.posts) {
            this.client
                .get("/timelines/home", {
                    max_id: this.state.posts[this.state.posts.length - 1].id,
                    limit: 20
                })
                .then((resp: any) => {
                    let newPosts: [Status] = resp.data;
                    let posts = this.state.posts as [Status];
                    newPosts.forEach((post: Status) => {
                        posts.push(post);
                    });
                    this.setState({
                        viewIsLoading: false,
                        viewDidLoad: true,
                        posts
                    });
                })
                .catch((err: Error) => {
                    this.setState({
                        viewIsLoading: false,
                        viewDidError: true,
                        viewDidErrorCode: err.message
                    });
                    this.props.enqueueSnackbar("Failed to get posts", {
                        variant: "error"
                    });
                });
        }
    }

    render() {
        const { classes } = this.props;
        const containerClasses = `${classes.pageLayoutMaxConstraints}${
            this.state.isMasonryLayout ? " " + classes.pageLayoutMasonry : ""
        }`;
        return (
            <div className={containerClasses}>
                {this.state.backlogPosts ? (
                    <div className={classes.pageTopChipContainer}>
                        <div className={classes.pageTopChips}>
                            <Slide direction="down" in={true}>
                                <Chip
                                    avatar={
                                        <Avatar>
                                            <ArrowUpwardIcon />
                                        </Avatar>
                                    }
                                    label={`View ${
                                        this.state.backlogPosts.length
                                    } new post${
                                        this.state.backlogPosts.length > 1
                                            ? "s"
                                            : ""
                                    }`}
                                    color="primary"
                                    className={classes.pageTopChip}
                                    onClick={() => this.insertBacklog()}
                                    clickable
                                />
                            </Slide>
                        </div>
                    </div>
                ) : null}
                {this.state.posts ? (
                    <div>
                        {this.state.isMasonryLayout ? (
                            <Masonry
                                breakpointCols={{
                                    default: 4,
                                    2000: 3,
                                    1400: 2,
                                    1050: 1
                                }}
                                className={classes.masonryGrid}
                                columnClassName={
                                    classes["my-masonry-grid_column"]
                                }
                            >
                                {this.state.posts.map((post: Status) => {
                                    return (
                                        <div
                                            className={classes.masonryGrid_item}
                                        >
                                            <Post
                                                key={post.id}
                                                post={post}
                                                client={this.client}
                                            />
                                        </div>
                                    );
                                })}
                            </Masonry>
                        ) : (
                            <div>
                                {this.state.posts.map((post: Status) => {
                                    return (
                                        <Post
                                            key={post.id}
                                            post={post}
                                            client={this.client}
                                        />
                                    );
                                })}
                            </div>
                        )}
                        <br />
                        {this.state.viewDidLoad && !this.state.viewDidError ? (
                            <div
                                style={{ textAlign: "center" }}
                                onClick={() => this.loadMoreTimelinePieces()}
                            >
                                <Button variant="contained">Load more</Button>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <span />
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

export default withStyles(styles)(withSnackbar(HomePage));
