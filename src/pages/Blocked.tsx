import React, { Component } from "react";
import { styles } from "./PageLayout.styles";

import {
    Button,
    CircularProgress,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    ListSubheader,
    Paper,
    Typography,
    Tooltip,
    withStyles,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField
} from "@material-ui/core";
import { withSnackbar } from "notistack";

import DomainIcon from "@material-ui/icons/Domain";
import CloseIcon from "@material-ui/icons/Close";

import Mastodon from "megalodon";

interface IBlockedState {
    viewIsLoading: boolean;
    viewDidLoad: boolean;
    viewDidError: boolean;
    addBlockOpen: boolean;
    blockedServers?: [string];
    blockTextField: string;
}

class Blocked extends Component<any, IBlockedState> {
    client: any;

    constructor(props: any) {
        super(props);
        this.client = new Mastodon(
            localStorage.getItem("access_token") as string,
            localStorage.getItem("baseurl") + "/api/v1"
        );

        this.state = {
            addBlockOpen: false,
            viewIsLoading: true,
            viewDidLoad: false,
            viewDidError: false,
            blockTextField: ""
        };
    }

    componentDidMount() {
        this.client
            .get("/domain_blocks")
            .then((resp: any) => {
                this.setState({
                    blockedServers: resp.data,
                    viewDidLoad: true,
                    viewIsLoading: false
                });
            })
            .catch((err: Error) => {
                console.error(err);
                this.setState({
                    viewIsLoading: false,
                    viewDidError: true
                });
            });
    }

    addBlock(domain: string) {
        this.client.post("/domain_blocks", { domain }).then((resp: any) => {
            this.props.enqueueSnackbar(`Blocked ${domain} successfully.`);

            let blockedServers = this.state.blockedServers;
            if (blockedServers && blockedServers.length > 0) {
                blockedServers.push(domain);
            } else {
                blockedServers = [domain];
            }

            this.setState({
                blockTextField: "",
                addBlockOpen: false,
                blockedServers
            });
        });
    }

    removeBlock(domain: string) {
        this.client
            .del("/domain_blocks", { domain })
            .then((resp: any) => {
                this.props.enqueueSnackbar(`Removed ${domain} from blacklist.`);
                let blockedServers = this.state.blockedServers;
                if (blockedServers && blockedServers.length > 0) {
                    blockedServers.splice(blockedServers.indexOf(domain), 1);
                }
                this.setState({
                    blockedServers
                });
            })
            .catch((err: Error) => {
                this.props.enqueueSnackbar(
                    `Couldn't remove ${domain}: ${err.name}`,
                    { variant: "error" }
                );
            });
    }

    updateTextField(value: string) {
        this.setState({
            blockTextField: value
        });
    }

    showAddBlockDialog() {
        return (
            <Dialog
                open={this.state.addBlockOpen}
                onClose={() => this.toggleAddBlockState()}
            >
                <DialogTitle id="alert-dialog-title">Add a domain</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Type the domain that you want to block. You won't see
                        any posts from this server or receive notifications from
                        them.
                    </DialogContentText>
                    <TextField
                        variant="outlined"
                        fullWidth
                        value={this.state.blockTextField}
                        placeholder="mastodon.social"
                        onChange={e => this.updateTextField(e.target.value)}
                    ></TextField>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => this.toggleAddBlockState()}
                        color="primary"
                        autoFocus
                    >
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        onClick={e => this.addBlock(this.state.blockTextField)}
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    toggleAddBlockState() {
        this.setState({ addBlockOpen: !this.state.addBlockOpen });
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.pageLayoutConstraints}>
                <ListSubheader>Blocked servers</ListSubheader>
                <Button
                    className={classes.clearAllButton}
                    variant="text"
                    onClick={() => this.toggleAddBlockState()}
                >
                    Add
                </Button>
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
                {this.state.blockedServers &&
                this.state.blockedServers.length > 0 ? (
                    <Paper className={classes.pageListConstraints}>
                        <List>
                            {this.state.blockedServers &&
                            this.state.blockedServers.length > 0
                                ? this.state.blockedServers.map(
                                      (domain: string) => (
                                          <ListItem key={domain}>
                                              <ListItemAvatar>
                                                  <DomainIcon color="action" />
                                              </ListItemAvatar>
                                              <ListItemText primary={domain} />
                                              <ListItemSecondaryAction>
                                                  <Tooltip title="Remove block">
                                                      <IconButton
                                                          onClick={() =>
                                                              this.removeBlock(
                                                                  domain
                                                              )
                                                          }
                                                      >
                                                          <CloseIcon />
                                                      </IconButton>
                                                  </Tooltip>
                                              </ListItemSecondaryAction>
                                          </ListItem>
                                      )
                                  )
                                : null}
                        </List>
                    </Paper>
                ) : this.state.viewDidError ? (
                    <Paper className={classes.errorCard}>
                        <Typography variant="h4">Bummer.</Typography>
                        <Typography variant="h6">
                            Something went wrong when loading blocked servers.
                        </Typography>
                    </Paper>
                ) : (
                    <Typography variant="h6" component="p">
                        No blocked servers found.
                    </Typography>
                )}
                <br />
                <Typography variant={"caption"}>
                    You won't see any public posts and notifications from the
                    following servers, and any followers from these servers are
                    automatically removed.
                </Typography>
                {this.showAddBlockDialog()}
            </div>
        );
    }
}

export default withStyles(styles)(withSnackbar(Blocked));
