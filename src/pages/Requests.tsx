import React, { Component } from "react";
import {
    CircularProgress,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    ListSubheader,
    Paper,
    Tooltip,
    Typography,
    withStyles
} from "@material-ui/core";
import { styles } from "./PageLayout.styles";
import { Account } from "../types/Account";
import Mastodon from "megalodon";
import { LinkableAvatar, LinkableIconButton } from "../interfaces/overrides";
import CheckIcon from "@material-ui/icons/Check";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import CloseIcon from "@material-ui/icons/Close";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { withSnackbar } from "notistack";

interface IRequestsPageState {
    viewLoading: boolean;
    viewLoaded?: boolean;
    viewErrored?: boolean;
    requestedAccounts?: [Account];
}

class RequestsPage extends Component<any, IRequestsPageState> {
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
        this.client
            .get("/follow_requests")
            .then((resp: any) => {
                let requestedAccounts: [Account] = resp.data;
                this.setState({
                    requestedAccounts,
                    viewLoading: false,
                    viewLoaded: true
                });
            })
            .catch((err: Error) => {
                this.setState({
                    viewLoading: false,
                    viewErrored: true
                });
                console.error(err.message);
            });
    }

    handleFollowRequest(acct: Account, type: "authorize" | "reject") {
        this.client
            .post(`/follow_requests/${acct.id}/${type}`)
            .then((resp: any) => {
                let requestedAccounts = this.state.requestedAccounts;
                if (requestedAccounts) {
                    requestedAccounts.forEach(
                        (request: Account, index: number) => {
                            if (requestedAccounts && request.id === acct.id) {
                                requestedAccounts.splice(index, 1);
                            }
                        }
                    );
                }
                this.setState({ requestedAccounts });

                let verb: string = type;
                verb === "authorize"
                    ? (verb = "authorized")
                    : (verb = "rejected");
                this.props.enqueueSnackbar(`You have ${verb} this request.`);
            })
            .catch((err: Error) => {
                this.props.enqueueSnackbar(
                    `Couldn't ${type} this request: ${err.name}`,
                    { variant: "error" }
                );
                console.error(err.message);
            });
    }

    showFollowRequests() {
        const { classes } = this.props;
        return (
            <div>
                <ListSubheader>Follow requests</ListSubheader>
                <Paper className={classes.pageListConstraints}>
                    <List>
                        {this.state.requestedAccounts
                            ? this.state.requestedAccounts.map(
                                  (request: Account) => {
                                      return (
                                          <ListItem key={request.id}>
                                              <ListItemAvatar>
                                                  <LinkableAvatar
                                                      to={`/profile/${request.id}`}
                                                      alt={request.username}
                                                      src={
                                                          request.avatar_static
                                                      }
                                                  />
                                              </ListItemAvatar>
                                              <ListItemText
                                                  primary={
                                                      request.display_name ||
                                                      request.acct
                                                  }
                                                  secondary={request.acct}
                                              />
                                              <ListItemSecondaryAction>
                                                  <Tooltip title="Accept request">
                                                      <IconButton
                                                          onClick={() =>
                                                              this.handleFollowRequest(
                                                                  request,
                                                                  "authorize"
                                                              )
                                                          }
                                                      >
                                                          <CheckIcon />
                                                      </IconButton>
                                                  </Tooltip>
                                                  <Tooltip title="Reject request">
                                                      <IconButton
                                                          onClick={() =>
                                                              this.handleFollowRequest(
                                                                  request,
                                                                  "reject"
                                                              )
                                                          }
                                                      >
                                                          <CloseIcon />
                                                      </IconButton>
                                                  </Tooltip>
                                                  <Tooltip title="View profile">
                                                      <LinkableIconButton
                                                          to={`/profile/${request.id}`}
                                                      >
                                                          <AccountCircleIcon />
                                                      </LinkableIconButton>
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
                {this.state.viewLoaded ? (
                    <div>
                        {this.state.requestedAccounts &&
                        this.state.requestedAccounts.length > 0 ? (
                            this.showFollowRequests()
                        ) : (
                            <div
                                className={
                                    classes.pageLayoutEmptyTextConstraints
                                }
                                style={{ textAlign: "center" }}
                            >
                                <CheckCircleIcon
                                    color="action"
                                    style={{ fontSize: 48 }}
                                />
                                <Typography variant="h6">
                                    You don't have any follow requests.
                                </Typography>
                                <br />
                            </div>
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

export default withStyles(styles)(withSnackbar(RequestsPage));
