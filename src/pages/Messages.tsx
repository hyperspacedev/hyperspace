import React, { Component } from "react";
import {
    withStyles,
    ListSubheader,
    Paper,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    ListItemAvatar,
    ListItemSecondaryAction,
    Tooltip,
    Typography
} from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import ForumIcon from "@material-ui/icons/Forum";
import MailIcon from "@material-ui/icons/Mail";
import { styles } from "./PageLayout.styles";
import Mastodon from "megalodon";
import { Status } from "../types/Status";
import { LinkableIconButton, LinkableAvatar } from "../interfaces/overrides";

interface IMessagesState {
    posts?: [Status];
    viewIsLoading: boolean;
    viewDidLoad?: boolean;
    viewDidError?: boolean;
    viewDidErrorCode?: any;
}

class MessagesPage extends Component<any, IMessagesState> {
    client: Mastodon;

    constructor(props: any) {
        super(props);

        this.client = new Mastodon(
            localStorage.getItem("access_token") as string,
            (localStorage.getItem("baseurl") as string) + "/api/v1"
        );

        this.state = {
            viewIsLoading: true
        };
    }

    componentWillMount() {
        this.client.get("/conversations").then(resp => {
            let data: any = resp.data;
            let messages: any = [];

            data.forEach((message: any) => {
                if (message.last_status !== null) {
                    messages.push(message.last_status);
                }
            });

            this.setState({
                posts: messages,
                viewIsLoading: false,
                viewDidLoad: true
            });
        });
    }

    removeHTMLContent(text: string) {
        const div = document.createElement("div");
        div.innerHTML = text;
        let innerContent = div.textContent || div.innerText || "";
        innerContent = innerContent.slice(0, 100) + "...";
        return innerContent;
    }

    renderMessage(message: Status) {
        return (
            <ListItem>
                <ListItemAvatar>
                    <LinkableAvatar
                        to={`/profile/${message.account.id}`}
                        alt={message.account.username}
                        src={message.account.avatar_static}
                    >
                        <PersonIcon />
                    </LinkableAvatar>
                </ListItemAvatar>
                <ListItemText
                    primary={
                        message.account.display_name ||
                        "@" + message.account.acct
                    }
                    secondary={this.removeHTMLContent(message.content)}
                />
                <ListItemSecondaryAction>
                    <Tooltip title="View conversation">
                        <LinkableIconButton to={`/conversation/${message.id}`}>
                            <ForumIcon />
                        </LinkableIconButton>
                    </Tooltip>
                </ListItemSecondaryAction>
            </ListItem>
        );
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.pageLayoutConstraints}>
                {this.state.viewDidLoad ? (
                    <div className={classes.pageListContsraints}>
                        {this.state.posts && this.state.posts.length > 0 ? (
                            <div>
                                <ListSubheader>Recent messages</ListSubheader>
                                <Paper className={classes.pageListConstraints}>
                                    <List>
                                        {this.state.posts
                                            ? this.state.posts.map(
                                                  (message: Status) =>
                                                      this.renderMessage(
                                                          message
                                                      )
                                              )
                                            : null}
                                    </List>
                                </Paper>
                                <br />
                            </div>
                        ) : (
                            <div>
                                <div
                                    className={
                                        classes.pageLayoutEmptyTextConstraints
                                    }
                                    style={{ textAlign: "center" }}
                                >
                                    <MailIcon
                                        color="action"
                                        style={{ fontSize: 48 }}
                                    />
                                    <Typography variant="h6">
                                        You don't have any messages.
                                    </Typography>
                                    <Typography paragraph>
                                        Why not interact with the fediverse a
                                        bit by sending a message?
                                    </Typography>
                                    <br />
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
                {this.state.viewIsLoading ? (
                    <div style={{ textAlign: "center" }}>
                        <CircularProgress
                            className={classes.progress}
                            color="primary"
                        />
                    </div>
                ) : null}
            </div>
        );
    }
}

export default withStyles(styles)(MessagesPage);
