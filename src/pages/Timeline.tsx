import React, { Component } from "react";
import {
    withStyles,
    CircularProgress,
    Typography,
    Paper,
    Button,
    Chip,
    Avatar,
    Slide,
    StyledComponentProps
} from "@material-ui/core";
import { styles } from "./PageLayout.styles";
import Post from "../components/Post";
import { Status } from "../types/Status";
import Mastodon, { StreamListener } from "megalodon";
import { withSnackbar, withSnackbarProps } from "notistack";
import Masonry from "react-masonry-css";
import { getUserDefaultBool } from "../utilities/settings";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";

/**
 * The basic interface for a timeline page's properties.
 */
interface ITimelinePageProps extends withSnackbarProps, StyledComponentProps {
    /**
     * The API endpoint for the timeline to fetch after starting
     * a stream.
     */
    timeline: string;

    /**
     * The API endpoint for the timeline to stream.
     */
    stream: string;
    classes?: any;
}

/**
 * The base interface for the timeline page's state.
 */
interface ITimelinePageState {
    /**
     * The list of posts from the timeline.
     */
    posts?: [Status];

    /**
     * The list of posts stored temporarily while viewing the timeline.
     *
     * Can be cleared when user pushes "Show x posts" button.
     */
    backlogPosts?: [Status] | null;

    /**
     * Whether the view is currently loading.
     */
    viewIsLoading: boolean;

    /**
     * Whether the view loaded successfully.
     */
    viewDidLoad?: boolean;

    /**
     * Whether the view errored.
     */
    viewDidError?: boolean;

    /**
     * The view's error code, if it errored.
     */
    viewDidErrorCode?: any;

    /**
     * Whether or not to use the masonry layout as defined in
     * the user settings.
     */
    isMasonryLayout?: boolean;

    /**
     * Whether posts should automatically load when scrolling.
     */
    isInfiniteScroll?: boolean;
}

/**
 * The base class for a timeline page.
 *
 * The timeline page streams a specific timeline. When the stream is connected,
 * the page will fetch a particular timeline list of posts. The timeline page will
 * also off-load incoming posts from the stream into a backlog that the user can
 * then insert by clicking a button.
 */
class TimelinePage extends Component<ITimelinePageProps, ITimelinePageState> {
    /**
     * The client to use.
     */
    client: Mastodon;

    /**
     * The page's stream listener.
     */
    streamListener: StreamListener;

    /**
     * Construct the timeline page.
     * @param props The timeline page's properties
     */
    constructor(props: ITimelinePageProps) {
        super(props);

        // Initialize the state.
        this.state = {
            viewIsLoading: true,
            backlogPosts: null,
            isMasonryLayout: getUserDefaultBool("isMasonryLayout"),
            isInfiniteScroll: getUserDefaultBool("isInfiniteScroll")
        };

        // Generate the client.
        this.client = new Mastodon(
            localStorage.getItem("access_token") as string,
            (localStorage.getItem("baseurl") as string) + "/api/v1"
        );

        // Create the stream listener from the properties.
        this.streamListener = this.client.stream(this.props.stream);

        this.loadMoreTimelinePieces = this.loadMoreTimelinePieces.bind(this);
        this.shouldLoadMorePosts = this.shouldLoadMorePosts.bind(this);
    }

    /**
     * Connect the stream listener and listen for new posts.
     */
    componentWillMount() {
        this.streamListener.on("connect", () => {
            // Get the latest posts from this timeline.
            this.client
                .get(this.props.timeline, { limit: 50 })
                // If we succeeded, update the state and turn off loading.
                .then((resp: any) => {
                    let statuses: [Status] = resp.data;
                    this.setState({
                        posts: statuses,
                        viewIsLoading: false,
                        viewDidLoad: true,
                        viewDidError: false
                    });
                })

                // Otherwise, update the state in error.
                .catch((resp: any) => {
                    this.setState({
                        viewIsLoading: false,
                        viewDidLoad: true,
                        viewDidError: true,
                        viewDidErrorCode: String(resp)
                    });

                    // Notify the user with a snackbar.
                    this.props.enqueueSnackbar("Failed to get posts.", {
                        variant: "error"
                    });
                });
        });

        // Store incoming posts into a backlog if possible.
        this.streamListener.on("update", (status: Status) => {
            let queue = this.state.backlogPosts;
            if (queue !== null && queue !== undefined) {
                queue.unshift(status);
            } else {
                queue = [status];
            }
            this.setState({ backlogPosts: queue });
        });

        // When a post is deleted in the backend, find the post in the list
        // and remove it from the list.
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

        // Display an error if the stream encounters and error.
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

    /**
     * Insert a delay between repeated function calls
     * codeburst.io/throttling-and-debouncing-in-javascript-646d076d0a44
     * @param delay How long to wait before calling function (ms)
     * @param fn The function to call
     */
    debounced(delay: number, fn: Function) {
        let lastCall = 0;
        return function(...args: any) {
            const now = new Date().getTime();
            if (now - lastCall < delay) {
                return;
            }
            lastCall = now;
            return fn(...args);
        };
    }

    /**
     * Listen for when scroll position changes
     */
    componentDidMount() {
        if (this.state.isInfiniteScroll) {
            window.addEventListener(
                "scroll",
                this.debounced(200, this.shouldLoadMorePosts)
            );
        }
    }

    /**
     * Halt the stream and scroll listeners when unmounting the component.
     */
    componentWillUnmount() {
        this.streamListener.stop();
        if (this.state.isInfiniteScroll) {
            window.removeEventListener("scroll", this.shouldLoadMorePosts);
        }
    }

    /**
     * Insert the posts from the backlog into the current list of posts
     * and clear the backlog.
     */
    insertBacklog() {
        window.scrollTo(0, 0);
        let posts = this.state.posts;
        let backlog = this.state.backlogPosts;
        if (posts && backlog && backlog.length > 0) {
            let push = backlog.concat(posts);
            this.setState({ posts: push as [Status], backlogPosts: null });
        }
    }

    /**
     * Load the next set of posts, if it exists.
     */
    loadMoreTimelinePieces() {
        // Reinstate the loading status.
        this.setState({ viewDidLoad: false, viewIsLoading: true });

        // If there are any posts, get the next set.
        if (this.state.posts) {
            this.client
                .get(this.props.timeline, {
                    max_id: this.state.posts[this.state.posts.length - 1].id,
                    limit: 50
                })

                // If we succeeded, append them to the end of the list of posts.
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

                // If we errored, display the error and don't do anything.
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

    /**
     * Load more posts when scroll is near the end of the page
     */
    shouldLoadMorePosts(e: Event) {
        let difference =
            document.body.clientHeight - window.scrollY - window.innerHeight;
        if (difference < 10000 && this.state.viewIsLoading === false) {
            this.loadMoreTimelinePieces();
        }
    }

    /**
     * Render the timeline page.
     */
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
                                            key={post.id}
                                        >
                                            <Post
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

export default withStyles(styles)(withSnackbar(TimelinePage));
