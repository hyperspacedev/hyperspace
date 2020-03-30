import React, { Component } from "react";
import {
    ListSubheader,
    withStyles,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Paper,
    CardHeader,
    Avatar
} from "@material-ui/core";

import { styles } from "./PageLayout.styles";
import AnnouncementIcon from "@material-ui/icons/Announcement";

import Mastodon from "megalodon";
import { Announcement } from "../types/Announcement";
import { withSnackbar } from "notistack";
import moment from "moment";

/**
 * The state interface for the notifications page.
 */
interface IAnnouncementsPageState {
    /**
     * The list of notifications, if it exists.
     */
    announcements?: [Announcement];

    /**
     * Whether the view is still loading.
     */
    viewIsLoading: boolean;

    /**
     * Whether the view has loaded.
     */
    viewDidLoad?: boolean;

    /**
     * Whether the view has loaded but in error.
     */
    viewDidError?: boolean;

    /**
     * The error code for an errored state, if possible.
     */
    viewDidErrorCode?: string;
}

/**
 * The notifications page.
 */
class AnnouncementsPage extends Component<any, IAnnouncementsPageState> {
    /**
     * The Mastodon object to perform notification operations on.
     */
    client: Mastodon;

    /**
     * The stream listener for tuning in to notifications.
     */
    streamListener: any;

    /**
     * Construct the notifications page.
     * @param props The properties to pass in
     */
    constructor(props: any) {
        super(props);

        // Create the Mastodon object.
        this.client = new Mastodon(
            localStorage.getItem("access_token") as string,
            localStorage.getItem("baseurl") + "/api/v1"
        );

        // Initialize the state.
        this.state = {
            viewIsLoading: true
        };
    }

    /**
     * Perform pre-mount tasks
     */
    async componentWillMount() {
        try {
            // Get the list of notifications
            let resp: any = await this.client.get("/announcements");
            let announcements: [Announcement] = resp.data;

            this.setState({
                announcements,
                viewIsLoading: false,
                viewDidLoad: true
            });
        } catch (e) {
            this.setState({
                viewDidLoad: true,
                viewIsLoading: false,
                viewDidError: true,
                viewDidErrorCode: e.message
            });
        }
    }

    /**
     * Render the announcements page.
     */
    render() {
        const { classes } = this.props;
        return (
            <div className={classes.pageLayoutConstraints}>
                {this.state.viewDidLoad ? (
                    this.state.announcements &&
                    this.state.announcements.length > 0 ? (
                        <div>
                            <ListSubheader>Current announcements</ListSubheader>
                            {this.state.announcements.map(
                                (announcement: Announcement) => {
                                    return (
                                        <Card>
                                            <CardHeader
                                                avatar={
                                                    <Avatar>
                                                        <AnnouncementIcon />
                                                    </Avatar>
                                                }
                                                title={`Published on ${moment(
                                                    announcement.published_at
                                                ).format(
                                                    "MMMM Do, YYYY [at] hh:mmA"
                                                )}`}
                                                subheader={
                                                    announcement.ends_at
                                                        ? `Expires ${moment(
                                                              announcement.ends_at
                                                          ).format(
                                                              "MMMM Do, YYYY"
                                                          )}`
                                                        : ""
                                                }
                                            ></CardHeader>
                                            <CardContent>
                                                <Typography
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            announcement.content
                                                    }}
                                                ></Typography>
                                            </CardContent>
                                        </Card>
                                    );
                                }
                            )}
                        </div>
                    ) : (
                        <div
                            className={classes.pageLayoutEmptyTextConstraints}
                            style={{ textAlign: "center" }}
                        >
                            <AnnouncementIcon
                                color="action"
                                style={{ fontSize: 48 }}
                            />
                            <Typography variant="h6">
                                No server announcements
                            </Typography>
                            <Typography paragraph>
                                There aren't any announcements in your
                                community. Announcements that use the
                                announcement feature on Mastodon will appear
                                here.
                            </Typography>
                            <br />
                        </div>
                    )
                ) : null}
                {this.state.viewDidError ? (
                    <Paper className={classes.errorCard}>
                        <Typography variant="h4">Bummer.</Typography>
                        <Typography variant="h6">
                            Something went wrong when loading announcements.
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

export default withStyles(styles)(withSnackbar(AnnouncementsPage));
