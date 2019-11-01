import React, { Component } from "react";
import {
    withStyles,
    Typography,
    CircularProgress,
    ListSubheader
} from "@material-ui/core";
import { styles } from "./PageLayout.styles";
import { UAccount, Account } from "../types/Account";
import { Tag } from "../types/Tag";
import Mastodon from "megalodon";

import FireplaceIcon from "@material-ui/icons/Fireplace";

interface IActivityPageState {
    user?: UAccount;
    trendingTags?: [Tag];
    profileDirectory?: [Account];
    viewLoading: boolean;
    viewLoaded?: boolean;
    viewErrored?: boolean;
}

class ActivityPage extends Component<any, IActivityPageState> {
    client: Mastodon;

    constructor(props: any) {
        super(props);

        this.client = new Mastodon(
            localStorage.getItem("access_token") as string,
            localStorage.getItem("baseurl") + "/api/v1"
        );

        this.state = {
            viewLoading: true
        };
    }

    componentDidMount() {
        this.getAccountData();

        this.client
            .get("/trends")
            .then((resp: any) => {
                let trendingTags: [Tag] = resp.data;
                this.setState({ trendingTags });
            })
            .catch((err: Error) => {
                this.setState({
                    viewLoading: false,
                    viewErrored: true
                });
                console.error(err.message);
            });

        this.client
            .get("/directory", { local: true, order: "active" })
            .then((resp: any) => {
                let profileDirectory: [Account] = resp.data;
                this.setState({
                    profileDirectory,
                    viewLoading: false,
                    viewLoaded: true
                });
            })
            .catch((err: Error) => {
                this.setState({
                    viewLoading: false,
                    viewErrored: true
                });
                console.log(err.message);
            });
    }

    getAccountData() {
        this.client
            .get("/accounts/verify_credentials")
            .then((resp: any) => {
                let data: UAccount = resp.data;
                this.setState({ user: data });
            })
            .catch((err: Error) => {
                this.props.enqueueSnackbar(
                    "Couldn't find profile info: " + err.name
                );
                console.error(err.message);
                let acct = localStorage.getItem("account") as string;
                this.setState({ user: JSON.parse(acct) });
            });
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.pageLayoutConstraints}>
                <div
                    style={{
                        textAlign: "center"
                    }}
                >
                    <FireplaceIcon style={{ fontSize: 64 }} />
                    <Typography variant="h6">
                        Hey there,{" "}
                        {this.state.user
                            ? this.state.user.display_name ||
                              this.state.user.acct
                            : "user"}
                        !
                    </Typography>
                    <Typography paragraph>
                        Take a look at what's been happening on your instance.
                    </Typography>
                </div>
                {this.state.viewLoaded ? (
                    <div>
                        <ListSubheader>Trending hashtags</ListSubheader>
                        {this.state.trendingTags &&
                        this.state.trendingTags.length > 0 ? (
                            <div></div>
                        ) : (
                            <Typography paragraph>
                                It looks like there aren't any trending tags on
                                your instance as of right now.
                            </Typography>
                        )}
                        <ListSubheader>
                            Active on profile directory
                        </ListSubheader>
                        {this.state.profileDirectory &&
                        this.state.profileDirectory.length > 0 ? (
                            <div></div>
                        ) : (
                            <Typography paragraph>
                                It looks like there aren't any people in the
                                profile directory yet.
                            </Typography>
                        )}
                    </div>
                ) : null}
                {this.state.viewLoading ? (
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

export default withStyles(styles)(ActivityPage);
