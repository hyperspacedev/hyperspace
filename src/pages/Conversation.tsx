import React, { Component } from "react";
import {
    withStyles,
    CircularProgress,
    Typography,
    Paper
} from "@material-ui/core";
import { styles } from "./PageLayout.styles";
import Post from "../components/Post";
import { Status } from "../types/Status";
import { Context } from "../types/Context";
import Mastodon from "megalodon";
import { withSnackbar } from "notistack";

interface IConversationPageState {
    posts?: [Status];
    viewIsLoading: boolean;
    viewDidLoad?: boolean;
    viewDidError?: boolean;
    viewDidErrorCode?: any;
    conversationId: string;
}

class Conversation extends Component<any, IConversationPageState> {
    client: Mastodon;
    streamListener: any;

    constructor(props: any) {
        super(props);

        this.state = {
            viewIsLoading: true,
            conversationId: props.match.params.conversationId
        };

        this.client = new Mastodon(
            localStorage.getItem("access_token") as string,
            (localStorage.getItem("baseurl") as string) + "/api/v1"
        );
    }

    getContext() {
        this.client
            .get(`/statuses/${this.state.conversationId}`)
            .then((resp: any) => {
                let result: Status = resp.data;
                this.setState({ posts: [result] });
            })
            .catch((err: Error) => {
                this.setState({
                    viewIsLoading: false,
                    viewDidError: true,
                    viewDidErrorCode: err.message
                });
                this.props.enqueueSnackbar(
                    "Couldn't get conversation: " + err.name,
                    { variant: "error" }
                );
            });
        this.client
            .get(`/statuses/${this.state.conversationId}/context`)
            .then((resp: any) => {
                let context: Context = resp.data;
                let posts = this.state.posts;
                let array: any[] = [];
                if (posts) {
                    array = array
                        .concat(context.ancestors)
                        .concat(posts)
                        .concat(context.descendants);
                }
                this.setState({
                    posts: array as [Status],
                    viewIsLoading: false,
                    viewDidLoad: true,
                    viewDidError: false
                });
            })
            .catch((err: Error) => {
                this.setState({
                    viewIsLoading: false,
                    viewDidError: true,
                    viewDidErrorCode: err.message
                });
                this.props.enqueueSnackbar(
                    "Couldn't get conversation: " + err.name,
                    { variant: "error" }
                );
            });
    }

    componentWillReceiveProps(props: any) {
        if (props.match.params.conversationId !== this.state.conversationId) {
            this.getContext();
        }
    }

    componentWillMount() {
        this.getContext();
    }

    componentDidUpdate() {
        const where: HTMLElement | null = document.getElementById(
            `post_${this.state.conversationId}`
        );
        if (
            where &&
            this.state.posts &&
            this.state.posts[0].id !== this.state.conversationId
        ) {
            window.scrollTo(0, where.getBoundingClientRect().top);
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.pageLayoutMaxConstraints}>
                {this.state.posts ? (
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
                ) : (
                    <span />
                )}
                {this.state.viewDidError ? (
                    <Paper className={classes.errorCard}>
                        <Typography variant="h4">Bummer.</Typography>
                        <Typography variant="h6">
                            Something went wrong when loading this conversation.
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

export default withStyles(styles)(withSnackbar(Conversation));
