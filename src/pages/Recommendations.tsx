import React, { Component } from "react";
import {
    withStyles,
    Typography,
    List,
    ListItem,
    Paper,
    ListItemText,
    ListItemSecondaryAction,
    ListItemAvatar,
    ListSubheader,
    CircularProgress,
    IconButton,
    Tooltip,
    Link
} from "@material-ui/core";
import { styles } from "./PageLayout.styles";
import Mastodon from "megalodon";
import { Account } from "../types/Account";
import { LinkableIconButton, LinkableAvatar } from "../interfaces/overrides";
import AssignmentIndIcon from "@material-ui/icons/AssignmentInd";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import { withSnackbar, withSnackbarProps } from "notistack";
import GroupIcon from "@material-ui/icons/Group";

interface IRecommendationsPageProps extends withSnackbarProps {
    classes: any;
}

interface IRecommendationsPageState {
    viewIsLoading: boolean;
    viewDidLoad?: boolean;
    viewDidError?: Boolean;
    viewDidErrorCode?: string;
    followSuggestions?: [Account];
}

class RecommendationsPage extends Component<
    IRecommendationsPageProps,
    IRecommendationsPageState
> {
    client: Mastodon;

    constructor(props: any) {
        super(props);
        this.client = new Mastodon(
            localStorage.getItem("access_token") as string,
            localStorage.getItem("baseurl") + "/api/v1"
        );
        this.state = {
            viewIsLoading: true
        };
    }

    componentDidMount() {
        this.client
            .get("/suggestions")
            .then((resp: any) => {
                let followSuggestions: [Account] = resp.data;
                this.setState({
                    viewIsLoading: false,
                    viewDidLoad: true,
                    followSuggestions
                });
            })
            .catch((err: Error) => {
                this.setState({
                    viewIsLoading: false,
                    viewDidError: true,
                    viewDidErrorCode: err.name
                });
                console.error(err.message);
            });
    }

    followMember(acct: Account) {
        this.client
            .post(`/accounts/${acct.id}/follow`)
            .then((resp: any) => {
                this.props.enqueueSnackbar(
                    "You are now following this account."
                );
                this.client.del(`/suggestions/${acct.id}`).then((resp: any) => {
                    let followSuggestions = this.state.followSuggestions;
                    if (followSuggestions) {
                        followSuggestions.forEach(
                            (suggestion: Account, index: number) => {
                                if (
                                    followSuggestions &&
                                    suggestion.id === acct.id
                                ) {
                                    followSuggestions.splice(index, 1);
                                }
                            }
                        );
                        this.setState({ followSuggestions });
                    }
                });
            })
            .catch((err: Error) => {
                this.props.enqueueSnackbar(
                    "Couldn't follow account: " + err.name,
                    { variant: "error" }
                );
                console.error(err.message);
            });
    }

    showFollowSuggestions() {
        const { classes } = this.props;
        return (
            <div>
                <ListSubheader>Suggested accounts</ListSubheader>
                <Paper className={classes.pageListConstraints}>
                    <List>
                        {this.state.followSuggestions
                            ? this.state.followSuggestions.map(
                                  (suggestion: Account) => {
                                      return (
                                          <ListItem key={suggestion.id}>
                                              <ListItemAvatar>
                                                  <LinkableAvatar
                                                      to={`/profile/${suggestion.id}`}
                                                      alt={suggestion.username}
                                                      src={
                                                          suggestion.avatar_static
                                                      }
                                                  />
                                              </ListItemAvatar>
                                              <ListItemText
                                                  primary={
                                                      suggestion.display_name ||
                                                      suggestion.acct
                                                  }
                                                  secondary={suggestion.acct}
                                              />
                                              <ListItemSecondaryAction>
                                                  <Tooltip title="View profile">
                                                      <LinkableIconButton
                                                          to={`/profile/${suggestion.id}`}
                                                      >
                                                          <AssignmentIndIcon />
                                                      </LinkableIconButton>
                                                  </Tooltip>
                                                  <Tooltip title="Follow">
                                                      <IconButton
                                                          onClick={() =>
                                                              this.followMember(
                                                                  suggestion
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
                              )
                            : null}
                    </List>
                </Paper>
                <br />
            </div>
        );
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.pageLayoutConstraints}>
                {this.state.viewDidLoad ? (
                    <div>
                        {this.state.followSuggestions &&
                        this.state.followSuggestions.length > 0 ? (
                            this.showFollowSuggestions()
                        ) : (
                            <div
                                className={
                                    classes.pageLayoutEmptyTextConstraints
                                }
                                style={{ textAlign: "center" }}
                            >
                                <GroupIcon
                                    color="action"
                                    style={{ fontSize: 48 }}
                                />
                                <Typography variant="h6">
                                    We don't have any suggestions for you.
                                </Typography>
                                <Typography paragraph>
                                    Take a look around the fediverse or check
                                    out the Activity page for more.
                                </Typography>
                                <br />
                            </div>
                        )}
                        <br />
                        <Typography variant="caption" paragraph>
                            Looking for follow requests? You can find them in
                            Settings or in the account menu. You can also{" "}
                            <Link href="/#/requests">click here</Link>.
                        </Typography>
                    </div>
                ) : null}
                {this.state.viewDidError ? (
                    <Paper className={classes.errorCard}>
                        <Typography variant="h4">Bummer.</Typography>
                        <Typography variant="h6">
                            Something went wrong when loading recommendations.
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

export default withStyles(styles)(withSnackbar(RecommendationsPage));
