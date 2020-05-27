import React, { Component } from "react";
import {
    Avatar,
    Button,
    CircularProgress,
    Paper,
    TextField,
    Typography,
    withStyles
} from "@material-ui/core";
import { withSnackbar, withSnackbarProps } from "notistack";
import { styles } from "./PageLayout.styles";
import { Account } from "../types/Account";
import Mastodon from "megalodon";
import filedialog from "file-dialog";

interface IYouProps extends withSnackbarProps {
    classes: any;
    onAvatarUpdate: Function;
}

interface IYouState {
    currentAccount?: Account;
    newDisplayName?: string;
    newBio?: string;
    viewIsLoading: boolean;
    viewLoaded: boolean;
    viewErrored: boolean;
}

class You extends Component<IYouProps, IYouState> {
    client: Mastodon;

    constructor(props: any) {
        super(props);

        this.client = new Mastodon(
            localStorage.getItem("access_token") as string,
            (localStorage.getItem("baseurl") as string) + "/api/v1"
        );

        this.state = {
            viewIsLoading: true,
            viewLoaded: false,
            viewErrored: false
        };
    }

    componentWillMount() {
        this.client
            .get("/accounts/verify_credentials")
            .then((resp: any) => {
                let currentAccount: Account = resp.data;
                this.setState({
                    currentAccount,
                    viewIsLoading: false,
                    viewLoaded: true
                });
            })
            .catch(() => {
                if (this.getAccount()) {
                    this.setState({
                        currentAccount: this.getAccount(),
                        viewIsLoading: false,
                        viewLoaded: true
                    });
                } else {
                    this.setState({
                        viewIsLoading: false,
                        viewErrored: true
                    });
                }
            });
    }

    getAccount() {
        let acct = localStorage.getItem("account");
        // console.log(acct);
        if (acct) {
            return JSON.parse(acct);
        }
    }

    updateAvatar() {
        filedialog({
            multiple: false,
            accept: "image/*"
        })
            .then((images: FileList) => {
                if (images.length > 0) {
                    this.props.enqueueSnackbar("Updating avatar...", {
                        persist: true,
                        key: "persistAvatar"
                    });
                    let upload = new FormData();
                    upload.append("avatar", images[0]);
                    this.client
                        .patch("/accounts/update_credentials", upload)
                        .then((acct: any) => {
                            let currentAccount: Account = acct.data;
                            this.setState({ currentAccount });
                            localStorage.setItem(
                                "account",
                                JSON.stringify(currentAccount)
                            );
                            this.props.closeSnackbar("persistAvatar");
                            this.props.enqueueSnackbar(
                                "Avatar updated successfully."
                            );
                            this.props.onAvatarUpdate(
                                currentAccount.avatar_static
                            );
                        })
                        .catch((err: Error) => {
                            this.props.closeSnackbar("persistAvatar");
                            this.props.enqueueSnackbar(
                                "Couldn't update avatar: " + err.name,
                                { variant: "error" }
                            );
                        });
                }
            })
            .catch((err: Error) => {
                this.props.enqueueSnackbar(
                    "Couldn't update avatar: " + err.name
                );
            });
    }

    updateHeader() {
        filedialog({
            multiple: false,
            accept: "image/*"
        })
            .then((images: FileList) => {
                if (images.length > 0) {
                    this.props.enqueueSnackbar("Updating header...", {
                        persist: true,
                        key: "persistHeader"
                    });
                    let upload = new FormData();
                    upload.append("header", images[0]);
                    this.client
                        .patch("/accounts/update_credentials", upload)
                        .then((acct: any) => {
                            let currentAccount: Account = acct.data;
                            this.setState({ currentAccount });
                            localStorage.setItem(
                                "account",
                                JSON.stringify(currentAccount)
                            );
                            this.props.closeSnackbar("persistHeader");
                            this.props.enqueueSnackbar(
                                "Header updated successfully."
                            );
                        })
                        .catch((err: Error) => {
                            this.props.closeSnackbar("persistHeader");
                            this.props.enqueueSnackbar(
                                "Couldn't update header: " + err.name,
                                { variant: "error" }
                            );
                        });
                }
            })
            .catch((err: Error) => {
                this.props.enqueueSnackbar(
                    "Couldn't update header: " + err.name
                );
            });
    }

    removeHTMLContent(text: string) {
        const div = document.createElement("div");
        div.innerHTML = text;
        return div.textContent || div.innerText || "";
    }
    changeDisplayName() {
        this.client
            .patch("/accounts/update_credentials", {
                display_name: this.state.newDisplayName
                    ? this.state.newDisplayName
                    : this.state.currentAccount
                    ? this.state.currentAccount.display_name
                    : ""
            })
            .then((acct: any) => {
                let currentAccount: Account = acct.data;
                this.setState({ currentAccount });
                localStorage.setItem("account", JSON.stringify(currentAccount));
                this.props.closeSnackbar("persistHeader");
                this.props.enqueueSnackbar(
                    "Display name updated to " + this.state.newDisplayName
                );
            })
            .catch((err: Error) => {
                console.error(err.name);
                this.props.closeSnackbar("persistHeader");
                this.props.enqueueSnackbar(
                    "Couldn't update display name: " + err.name,
                    { variant: "error" }
                );
            });
    }

    updateDisplayName(name: string) {
        this.setState({ newDisplayName: name });
    }
    changeBio() {
        this.client
            .patch("/accounts/update_credentials", {
                note: this.state.newBio
                    ? this.state.newBio
                    : this.state.currentAccount
                    ? this.state.currentAccount.note
                    : ""
            })
            .then((acct: any) => {
                let currentAccount: Account = acct.data;
                this.setState({ currentAccount });
                localStorage.setItem("account", JSON.stringify(currentAccount));
                this.props.closeSnackbar("persistHeader");
                this.props.enqueueSnackbar("Bio updated successfully.");
            })
            .catch((err: Error) => {
                console.error(err.name);
                this.props.closeSnackbar("persistHeader");
                this.props.enqueueSnackbar("Couldn't update bio: " + err.name, {
                    variant: "error"
                });
            });
    }

    updateBio(bio: string) {
        this.setState({ newBio: bio });
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.pageLayoutMinimalConstraints}>
                {this.state.viewErrored ? (
                    <Paper className={classes.errorCard}>
                        <Typography variant="h4">Bummer.</Typography>
                        <Typography variant="h6">
                            Something went wrong when trying to get your account
                            information.
                        </Typography>
                    </Paper>
                ) : (
                    <span />
                )}
                {this.state.currentAccount ? (
                    <div>
                        <div className={classes.pageHeroBackground}>
                            <div
                                className={classes.pageHeroBackgroundImage}
                                style={{
                                    backgroundImage: `url("${this.state.currentAccount.header_static}")`
                                }}
                            />
                            <div className={classes.profileContent}>
                                <br />
                                <Avatar
                                    className={classes.profileAvatar}
                                    src={
                                        this.state.currentAccount.avatar_static
                                    }
                                />
                                <div
                                    className={classes.profileUserBox}
                                    style={{ paddingTop: 8, paddingBottom: 8 }}
                                >
                                    <Typography
                                        variant="h4"
                                        color="inherit"
                                        component="h1"
                                    >
                                        Edit your profile
                                    </Typography>
                                    <Typography color="inherit">
                                        Change information such as your display
                                        name, bio, and images used here.
                                    </Typography>
                                    <div>
                                        <Button
                                            className={
                                                classes.pageProfileFollowButton
                                            }
                                            variant="contained"
                                            onClick={() => this.updateAvatar()}
                                        >
                                            Change Avatar
                                        </Button>
                                        <Button
                                            className={
                                                classes.pageProfileFollowButton
                                            }
                                            variant="contained"
                                            onClick={() => this.updateHeader()}
                                        >
                                            Change Header
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={classes.pageContentLayoutConstraints}>
                            <Paper className={classes.youPaper}>
                                <Typography variant="h6" component="h2">
                                    Display name
                                </Typography>
                                <Typography>
                                    Your display name is your nickname on the
                                    fediverse; it differs from the username or
                                    account name. You may include emoji
                                    shortcodes in your display name.
                                </Typography>
                                <br />
                                <Typography>
                                    Some servers may require you to create your
                                    display name under certain rules.
                                </Typography>
                                <br />
                                <TextField
                                    className={classes.TextField}
                                    defaultValue={
                                        this.state.currentAccount.display_name
                                    }
                                    rowsMax="1"
                                    variant="outlined"
                                    fullWidth
                                    onChange={(event: any) =>
                                        this.updateDisplayName(
                                            event.target.value
                                        )
                                    }
                                />
                                <div style={{ textAlign: "right" }}>
                                    <Button
                                        className={
                                            classes.pageProfileFollowButton
                                        }
                                        color="primary"
                                        onClick={() => this.changeDisplayName()}
                                    >
                                        Update display Name
                                    </Button>
                                </div>
                            </Paper>
                            <br />
                            <Paper className={classes.youPaper}>
                                <Typography variant="h6" component="h2">
                                    About you
                                </Typography>
                                <Typography>
                                    Your biography lets you tell the fediverse
                                    who you are. Your biography can contain
                                    hashtags, account mentions, and emojis with
                                    shortcodes.
                                </Typography>
                                <br />
                                <TextField
                                    className={classes.TextField}
                                    defaultValue={
                                        this.state.currentAccount.note
                                            ? this.removeHTMLContent(
                                                  this.state.currentAccount.note
                                              )
                                            : "Tell a little bit about yourself"
                                    }
                                    multiline
                                    variant="outlined"
                                    rows="2"
                                    rowsMax="5"
                                    fullWidth
                                    onChange={(event: any) =>
                                        this.updateBio(event.target.value)
                                    }
                                />
                                <div style={{ textAlign: "right" }}>
                                    <Button
                                        className={
                                            classes.pageProfileFollowButton
                                        }
                                        color="primary"
                                        onClick={() => this.changeBio()}
                                    >
                                        Update biography
                                    </Button>
                                </div>
                            </Paper>
                        </div>
                    </div>
                ) : (
                    "AAA"
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

export default withStyles(styles)(withSnackbar(You));
