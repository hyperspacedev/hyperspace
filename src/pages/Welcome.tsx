import React, { Component } from "react";
import {
    withStyles,
    Paper,
    Typography,
    Button,
    TextField,
    Fade,
    Link,
    CircularProgress,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    ListItemSecondaryAction,
    IconButton,
    InputAdornment
} from "@material-ui/core";
import { styles } from "./WelcomePage.styles";
import Mastodon from "megalodon";
import { SaveClientSession } from "../types/SessionData";
import {
    createHyperspaceApp,
    getRedirectAddress,
    inDisallowedDomains,
    instancesBearerKey
} from "../utilities/login";
import { parseUrl } from "query-string";
import { getConfig } from "../utilities/settings";
import { isDarwinApp } from "../utilities/desktop";
import axios from "axios";
import { withSnackbar, withSnackbarProps } from "notistack";
import { Config } from "../types/Config";
import {
    getAccountRegistry,
    loginWithAccount,
    removeAccountFromRegistry
} from "../utilities/accounts";
import { MultiAccount } from "../types/Account";

import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import CloseIcon from "@material-ui/icons/Close";

/**
 * Basic props for Welcome page
 */
interface IWelcomeProps extends withSnackbarProps {
    classes: any;
}

/**
 * Basic state for welcome page
 */
interface IWelcomeState {
    /**
     * The custom-defined URL to the logo to display
     */
    logoUrl?: string;

    /**
     * The custom-defined URL to the background image to display
     */
    backgroundUrl?: string;

    /**
     * The custom-defined brand name of this app
     */
    brandName?: string;

    /**
     * The custom-defined server address to register to
     */
    registerBase?: string;

    /**
     * Whether this version of Hyperspace has federation
     */
    federates?: boolean;

    /**
     * Whether Hyperspace is ready to get the auth code
     */
    proceedToGetCode: boolean;

    /**
     * The currently "logged-in" user after the first step
     */
    user: string;

    /**
     * Whether the user's input errors
     */
    userInputError: boolean;

    /**
     * The user input error message, if any
     */
    userInputErrorMessage: string;

    /**
     * The app's client ID, if registered
     */
    clientId?: string;

    /**
     * The app's client secret, if registered
     */
    clientSecret?: string;

    /**
     * The authorization URL provided by Mastodon from the
     * client ID and secret
     */
    authUrl?: string;

    /**
     * Whether a previous login attempt is present
     */
    foundSavedLogin: boolean;

    /**
     * Whether Hyperspace is in the process of authorizing
     */
    authorizing: boolean;

    /**
     * The custom-defined license for the Hyperspace source code
     */
    license?: string;

    /**
     * The custom-defined URL to the source code of Hyperspace
     */
    repo?: string;

    /**
     * The default address to redirect to. Used in login inits and
     * when the authorization code completes.
     */
    defaultRedirectAddress: string;

    /**
     * Whether the redirect address is set to 'dynamic'.
     */
    redirectAddressIsDynamic: boolean;

    /**
     * Whether the authorization dialog for the emergency login is
     * open.
     */
    openAuthDialog: boolean;

    /**
     * The authorization code to fetch an access token with
     */
    authCode: string;

    /**
     * Whether the Emergency Mode has been initiated
     */
    emergencyMode: boolean;

    /**
     * The current app version
     */
    version: string;

    /**
     * Whether we are in the process of adding a new account or not
     */
    willAddAccount: boolean;
}

/**
 * The base class for the Welcome page.
 *
 * The Welcome page is responsible for handling the registration,
 * login, and authorization of accounts into the Hyperspace app.
 */
class WelcomePage extends Component<IWelcomeProps, IWelcomeState> {
    /**
     * The associated Mastodon client to handle logins/authorizations
     * with
     */
    client: any;

    /**
     * Construct the state and other components of the Welcome page
     * @param props The properties passed onto the page
     */
    constructor(props: any) {
        super(props);

        // Set up our state
        this.state = {
            proceedToGetCode: false,
            user: "",
            userInputError: false,
            foundSavedLogin: false,
            authorizing: false,
            userInputErrorMessage: "",
            defaultRedirectAddress: "",
            redirectAddressIsDynamic: false,
            openAuthDialog: false,
            authCode: "",
            emergencyMode: false,
            version: "",
            willAddAccount: false
        };

        // Read the configuration data and update the state
        getConfig()
            .then((result: any) => {
                if (result !== undefined) {
                    let config: Config = result;

                    // Warn if the location is dynamic (unexpected behavior)
                    if (config.location === "dynamic") {
                        console.warn(
                            "Redirect URI is set to dynamic, which may affect how sign-in works for some users. Careful!"
                        );
                    }

                    // Reset to mastodon.social if the location is a disallowed
                    // domain.
                    if (
                        inDisallowedDomains(result.registration.defaultInstance)
                    ) {
                        console.warn(
                            `The default instance field in config.json contains an unsupported domain (${result.registration.defaultInstance}), so it's been reset to mastodon.social.`
                        );
                        result.registration.defaultInstance = "mastodon.social";
                    }

                    // Update the state as per the configuration
                    this.setState({
                        logoUrl: config.branding?.logo ?? "logo.png",
                        backgroundUrl:
                            config.branding?.background ?? "background.png",
                        brandName: config.branding?.name ?? "Hyperspace",
                        registerBase:
                            result.registration?.defaultInstance ?? "",
                        federates: config.federation.universalLogin,
                        license: config.license.url,
                        repo: config.repository,
                        defaultRedirectAddress:
                            config.location !== "dynamic"
                                ? config.location
                                : `https://${window.location.host}`,
                        redirectAddressIsDynamic: config.location === "dynamic",
                        version: config.version
                    });
                }
            })

            // Print an error if the config wasn't found.
            .catch(() => {
                console.error(
                    "config.json is missing. If you want to customize Hyperspace, please include config.json"
                );
            });
    }

    /**
     * Look for any existing logins and tokens before presenting
     * the login page
     */
    componentDidMount() {
        if (localStorage.getItem("login")) {
            this.getSavedSession();
            this.setState({
                foundSavedLogin: true
            });
            this.checkForToken();
        }
    }

    /**
     * Update the user field in the state
     * @param user The string to update the state to
     */
    updateUserInfo(user: string) {
        this.setState({ user });
    }

    /**
     * Update the auth code in the state
     * @param code The authorization code to update the state to
     */
    updateAuthCode(code: string) {
        this.setState({ authCode: code });
    }

    /**
     * Toggle the visibility of the authorization dialog
     */
    toggleAuthDialog() {
        this.setState({ openAuthDialog: !this.state.openAuthDialog });
    }

    /**
     * Determine whether the app is ready to open the authorization
     * process.
     */
    readyForAuth() {
        return localStorage.getItem("baseurl") !== null;
    }

    /**
     * Clear the current access token and base URL
     */
    clear() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("baseurl");
    }

    /**
     * Get the current saved session from the previous login
     * attempt and update the state
     */
    getSavedSession() {
        if (localStorage.getItem("login") === null) {
            return;
        }
        let loginData = localStorage.getItem("login") as string;
        let session: SaveClientSession = JSON.parse(loginData);
        this.setState({
            clientId: session.clientId,
            clientSecret: session.clientSecret,
            authUrl: session.authUrl,
            emergencyMode: session.emergency
        });
    }

    /**
     * Start the emergency login mode.
     */
    startEmergencyLogin() {
        if (!this.state.emergencyMode) {
            this.createEmergencyLogin();
        }
        this.toggleAuthDialog();
    }

    /**
     * Start the registration process.
     * @returns A URL pointing to the signup page of the base as defined
     * in the config's `registerBase` field
     */
    startRegistration() {
        return this.state.registerBase
            ? "https://" + this.state.registerBase + "/auth/sign_up"
            : "https://joinmastodon.org/#getting-started";
    }

    /**
     * Watch the keyboard and start the login procedure if the user
     * presses the ENTER/RETURN key
     * @param event The keyboard event
     */
    watchUsernameField(event: any) {
        if (event.keyCode === 13) this.startLogin();
    }

    /**
     * Watch the keyboard and start the emergency login auth procedure
     * if the user presses the ENTER/RETURN key
     * @param event The keyboard event
     */
    watchAuthField(event: any) {
        if (event.keyCode === 13) this.authorizeEmergencyLogin();
    }

    /**
     * Get the "logged-in" user by reading the username string
     * from the first field on the login page.
     * @param user The user string to parse
     * @returns The base URL of the user
     */
    getLoginUser(user: string) {
        // Did the user include "@"? They probably are not from the
        // server defined in config
        if (user.includes("@")) {
            if (this.state.federates) {
                let newUser = user;
                this.setState({ user: newUser });
                return "https://" + newUser.split("@")[1];
            } else {
                let newUser = `${user}@${this.state.registerBase ??
                    "mastodon.social"}`;
                this.setState({ user: newUser });
                return (
                    "https://" + (this.state.registerBase ?? "mastodon.social")
                );
            }
        }

        // Otherwise, treat them as if they're from the server
        else {
            let newUser = `${user}@${this.state.registerBase ??
                "mastodon.social"}`;
            this.setState({ user: newUser });
            return "https://" + (this.state.registerBase ?? "mastodon.social");
        }
    }

    /**
     * Check the user string for any errors and then create a client with an
     * ID and secret to start the authorization process.
     */
    startLogin() {
        // Check if we have errored
        let error = this.checkForErrors();

        // If we didn't, create the Hyperspace app to register onto that Mastodon
        // server.
        if (!error) {
            // Define the app's scopes and base URL
            const scopes = "read write follow";
            const baseurl = this.getLoginUser(this.state.user);
            localStorage.setItem("baseurl", baseurl);

            // Create the Hyperspace app
            createHyperspaceApp(
                this.state.brandName ?? "Hyperspace",
                scopes,
                baseurl,
                getRedirectAddress(this.state.defaultRedirectAddress)
            )
                // If we succeeded, create a login attempt for later reference
                .then((resp: any) => {
                    let saveSessionForCrashing: SaveClientSession = {
                        clientId: resp.clientId,
                        clientSecret: resp.clientSecret,
                        authUrl: resp.url,
                        emergency: false
                    };
                    localStorage.setItem(
                        "login",
                        JSON.stringify(saveSessionForCrashing)
                    );

                    // Finally, update the state
                    this.setState({
                        clientId: resp.clientId,
                        clientSecret: resp.clientSecret,
                        authUrl: resp.url,
                        proceedToGetCode: true
                    });
                });
        }
    }

    /**
     * Create an emergency mode login. This is usually initiated when the
     * "click-to-authorize" method fails and the user needs to copy and paste
     * an authorization code manually.
     */
    createEmergencyLogin() {
        console.log("Creating an emergency login...");

        // Set up the scopes and base URL
        const scopes = "read write follow";
        const baseurl =
            localStorage.getItem("baseurl") ||
            this.getLoginUser(this.state.user);

        // Register the Mastodon app with the Mastodon server
        Mastodon.registerApp(
            this.state.brandName ?? "Hyperspace",
            {
                scopes: scopes
            },
            baseurl
        )
            // If we succeed, create a login attempt for later reference
            .then((appData: any) => {
                let saveSessionForCrashing: SaveClientSession = {
                    clientId: appData.clientId,
                    clientSecret: appData.clientSecret,
                    authUrl: appData.url,
                    emergency: true
                };
                localStorage.setItem(
                    "login",
                    JSON.stringify(saveSessionForCrashing)
                );

                // Finally, update the state
                this.setState({
                    clientId: appData.clientId,
                    clientSecret: appData.clientSecret,
                    authUrl: appData.url
                });
            });
    }

    /**
     * Open the URL to redirect to an authorization sequence from an emergency
     * login.
     *
     * Since Hyperspace reads the auth code from the URL, we need to redirect to
     * a URL with the code inside to trigger an auth
     */
    authorizeEmergencyLogin() {
        let redirAddress =
            this.state.defaultRedirectAddress === "desktop"
                ? "hyperspace://hyperspace/app"
                : this.state.defaultRedirectAddress;
        window.location.href = `${redirAddress}/?code=${this.state.authCode}#/`;
    }

    /**
     * Restore a login attempt from a session
     */
    resumeLogin() {
        let loginData = localStorage.getItem("login");
        if (loginData) {
            let session: SaveClientSession = JSON.parse(loginData);
            this.setState({
                clientId: session.clientId,
                clientSecret: session.clientSecret,
                authUrl: session.authUrl,
                emergencyMode: session.emergency,
                proceedToGetCode: true
            });
        }
    }

    /**
     * Check the user input string for any possible errors
     */
    checkForErrors(): boolean {
        let userInputError = false;
        let userInputErrorMessage = "";

        // Is the user string blank?
        if (this.state.user === "") {
            userInputError = true;
            userInputErrorMessage = "Username cannot be blank.";
            this.setState({ userInputError, userInputErrorMessage });
            return true;
        } else {
            if (this.state.user.includes("@")) {
                if (this.state.federates && this.state.federates === true) {
                    let baseUrl = this.state.user.split("@")[1];

                    // Is the user's domain in the disallowed list?
                    if (inDisallowedDomains(baseUrl)) {
                        this.setState({
                            userInputError: true,
                            userInputErrorMessage: `Signing in with an account from ${baseUrl} isn't supported.`
                        });
                        return true;
                    } else {
                        // Are we unable to ping the server?
                        axios
                            .get(
                                "https://instances.social/api/1.0/instances/show?name=" +
                                    baseUrl,
                                {
                                    headers: {
                                        Authorization: `Bearer ${instancesBearerKey}`
                                    }
                                }
                            )
                            .catch((err: Error) => {
                                let userInputError = true;
                                let userInputErrorMessage =
                                    "Instance name is invalid.";
                                this.setState({
                                    userInputError,
                                    userInputErrorMessage
                                });
                                return true;
                            });
                    }
                } else if (
                    this.state.user.includes(
                        this.state.registerBase ?? "mastodon.social"
                    )
                ) {
                    this.setState({ userInputError, userInputErrorMessage });
                    return false;
                } else {
                    userInputError = true;
                    userInputErrorMessage =
                        "You cannot sign in with this username.";
                    this.setState({ userInputError, userInputErrorMessage });
                    return true;
                }
            } else {
                this.setState({ userInputError, userInputErrorMessage });
                return false;
            }
            this.setState({ userInputError, userInputErrorMessage });
            return false;
        }
    }

    /**
     * Read the URL and determine whether or not there's an auth code
     * in the URL. If there is, try to authorize and get the access
     * token for storage.
     */
    checkForToken() {
        let location = window.location.href;

        // Is there an auth code?
        if (location.includes("?code=")) {
            let code = parseUrl(location).query.code as string;
            this.setState({ authorizing: true });
            let loginData = localStorage.getItem("login");

            // If there's login data, try to fetch an access token
            if (loginData) {
                let clientLoginSession: SaveClientSession = JSON.parse(
                    loginData
                );

                getConfig().then((resp: any) => {
                    if (resp === undefined) {
                        return;
                    }

                    let conf: Config = resp;

                    let redirectUrl: string | undefined =
                        this.state.emergencyMode ||
                        clientLoginSession.authUrl.includes(
                            "urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob"
                        )
                            ? undefined
                            : getRedirectAddress(conf.location);

                    Mastodon.fetchAccessToken(
                        clientLoginSession.clientId,
                        clientLoginSession.clientSecret,
                        code,
                        localStorage.getItem("baseurl") as string,
                        redirectUrl
                    )
                        .then((tokenData: any) => {
                            localStorage.setItem(
                                "access_token",
                                tokenData.access_token
                            );
                            window.location.href =
                                window.location.protocol === "hyperspace:"
                                    ? "hyperspace://hyperspace/app/"
                                    : this.state.defaultRedirectAddress;
                        })
                        .catch((err: Error) => {
                            this.props.enqueueSnackbar(
                                `Couldn't authorize ${this.state.brandName ??
                                    "Hyperspace"}: ${err.name}`,
                                { variant: "error" }
                            );
                            console.error(err.message);
                        });
                });
            }
        }
    }

    /**
     * Redirect to the app's main view after a login.
     */
    redirectToApp() {
        window.location.href =
            window.location.protocol === "hyperspace:"
                ? "hyperspace://hyperspace/app"
                : this.state.redirectAddressIsDynamic
                ? `https://${window.location.host}/#/`
                : this.state.defaultRedirectAddress + "/#/";
    }

    /**
     * Render the title bar for macOS
     */
    titlebar() {
        const { classes } = this.props;
        if (isDarwinApp()) {
            return (
                <div className={classes.titleBarRoot}>
                    <Typography className={classes.titleBarText}>
                        {this.state.brandName ?? "Hyperspace"}
                    </Typography>
                </div>
            );
        }
    }

    /**
     * Show the multi-user account panel
     */
    showMultiAccount() {
        const { classes } = this.props;
        return (
            <div>
                <Typography variant="h5">Select an account</Typography>
                <Typography>from the list below or add a new one</Typography>

                <List>
                    {getAccountRegistry().map(
                        (account: MultiAccount, index: number) => (
                            <ListItem
                                onClick={() => {
                                    loginWithAccount(account);
                                    this.redirectToApp();
                                }}
                                button={true}
                            >
                                <ListItemAvatar>
                                    <AccountCircleIcon color="action" />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={`@${account.username}`}
                                    secondary={account.host}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        onClick={(e: any) => {
                                            e.preventDefault();
                                            removeAccountFromRegistry(index);
                                            window.location.reload();
                                        }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        )
                    )}
                </List>
                <div className={classes.middlePadding} />

                <Button
                    onClick={() => {
                        this.setState({ willAddAccount: true });
                        this.clear();
                    }}
                    color={"primary"}
                    variant={"contained"}
                >
                    Add Account
                </Button>
            </div>
        );
    }

    /**
     * Show the main landing panel
     */
    showLanding() {
        const { classes } = this.props;
        return (
            <div>
                <Typography variant="h5">Sign in</Typography>
                <Typography>with your fediverse account</Typography>
                <div className={classes.middlePadding} />
                <TextField
                    variant="outlined"
                    label="Username"
                    fullWidth
                    placeholder="example@mastodon.example"
                    onChange={event => this.updateUserInfo(event.target.value)}
                    onKeyDown={event => this.watchUsernameField(event)}
                    error={this.state.userInputError}
                    onBlur={() => this.checkForErrors()}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">@</InputAdornment>
                        )
                    }}
                />
                {this.state.userInputError ? (
                    <Typography color="error">
                        {this.state.userInputErrorMessage}
                    </Typography>
                ) : null}
                <br />
                {this.state.registerBase && this.state.federates ? (
                    <Typography variant="caption">
                        Not from{" "}
                        <b>{this.state.registerBase ?? "noinstance"}</b>? Sign
                        in with your{" "}
                        <Link
                            href="https://docs.joinmastodon.org/user/signup/#address"
                            target="_blank"
                            rel="noopener noreferrer"
                            color="secondary"
                        >
                            full username
                        </Link>
                        .
                    </Typography>
                ) : null}
                <br />
                {this.state.foundSavedLogin ? (
                    <Typography>
                        Signing in from a previous session?{" "}
                        <Link
                            className={classes.welcomeLink}
                            onClick={() => this.resumeLogin()}
                        >
                            Continue login
                        </Link>
                        .
                    </Typography>
                ) : null}

                <div className={classes.middlePadding} />
                <div style={{ display: "flex" }}>
                    <Tooltip title="Create account on site">
                        <Button
                            href={this.startRegistration()}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Create account
                        </Button>
                    </Tooltip>
                    <div className={classes.flexGrow} />
                    <Tooltip title="Continue sign-in">
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={() => this.startLogin()}
                        >
                            Next
                        </Button>
                    </Tooltip>
                </div>
            </div>
        );
    }

    /**
     * Show the login auth panel
     */
    showLoginAuth() {
        const { classes } = this.props;
        return (
            <div>
                <Typography variant="h5">
                    Howdy, {this.state.user?.split("@")[0] ?? "user"}
                </Typography>
                <Typography>
                    To continue, finish signing in on your instance's website
                    and authorize {this.state.brandName ?? "Hyperspace"}.
                </Typography>
                <div className={classes.middlePadding} />
                <div style={{ display: "flex" }}>
                    <div className={classes.flexGrow} />
                    <Button
                        color="primary"
                        variant="contained"
                        size="large"
                        href={this.state.authUrl ?? ""}
                    >
                        Authorize
                    </Button>
                    <div className={classes.flexGrow} />
                </div>
                <div className={classes.middlePadding} />
                <Typography>
                    Having trouble signing in?{" "}
                    <Link
                        onClick={() => this.startEmergencyLogin()}
                        className={classes.welcomeLink}
                    >
                        Sign in with a code.
                    </Link>
                </Typography>
            </div>
        );
    }

    /**
     * Show the emergency login panel
     */
    showAuthDialog() {
        return (
            <Dialog
                open={this.state.openAuthDialog}
                disableBackdropClick
                disableEscapeKeyDown
                maxWidth="sm"
                fullWidth={true}
            >
                <DialogTitle>Authorize with a code</DialogTitle>
                <DialogContent>
                    <Typography paragraph>
                        If you're having trouble authorizing Hyperspace, you can
                        manually request for an authorization code. Click
                        'Request Code' and then paste the code in the
                        authorization code box to continue.
                    </Typography>
                    <Button
                        color="primary"
                        variant="contained"
                        href={this.state.authUrl ?? ""}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Request Code
                    </Button>
                    <br />
                    <br />
                    <TextField
                        variant="outlined"
                        label="Authorization code"
                        fullWidth
                        onChange={event =>
                            this.updateAuthCode(event.target.value)
                        }
                        onKeyDown={event => this.watchAuthField(event)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.toggleAuthDialog()}>
                        Cancel
                    </Button>
                    <Button
                        color="secondary"
                        onClick={() => this.authorizeEmergencyLogin()}
                    >
                        Authorize
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    /**
     * Show the authorizing panel
     */
    showAuthorizationLoader() {
        const { classes } = this.props;
        return (
            <div>
                <Typography variant="h5">Authorizing</Typography>
                <Typography>
                    Please wait while Hyperspace authorizes with your instance.
                    This shouldn't take long...
                </Typography>
                <div className={classes.middlePadding} />
                <div style={{ display: "flex" }}>
                    <div className={classes.flexGrow} />
                    <CircularProgress />
                    <div className={classes.flexGrow} />
                </div>
                <div className={classes.middlePadding} />
            </div>
        );
    }

    /**
     * Render the page
     */
    render() {
        const { classes } = this.props;
        return (
            <div>
                {this.titlebar()}
                <div
                    className={classes.root}
                    style={{
                        backgroundImage: `url(${this.state.backgroundUrl ??
                            "background.png"})`
                    }}
                >
                    <Paper className={classes.paper}>
                        <img
                            className={classes.logo}
                            alt={this.state.brandName ?? "Hyperspace"}
                            src={this.state.logoUrl ?? "logo.png"}
                        />
                        <br />
                        <Fade in={true}>
                            {this.state.authorizing
                                ? this.showAuthorizationLoader()
                                : this.state.proceedToGetCode
                                ? this.showLoginAuth()
                                : getAccountRegistry().length > 0 &&
                                  !this.state.willAddAccount
                                ? this.showMultiAccount()
                                : this.showLanding()}
                        </Fade>
                        <br />
                        <Typography variant="caption">
                            &copy; {new Date().getFullYear()}{" "}
                            {this.state.brandName &&
                            this.state.brandName !== "Hyperspace"
                                ? `${this.state.brandName} developers and the `
                                : ""}{" "}
                            <Link
                                className={classes.welcomeLink}
                                href="https://hyperspace.marquiskurt.net"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Hyperspace
                            </Link>{" "}
                            developers. All rights reserved.
                        </Typography>
                        <Typography variant="caption">
                            {this.state.repo ? (
                                <span>
                                    <Link
                                        className={classes.welcomeLink}
                                        href={
                                            this.state.repo ??
                                            "https://github.com/hyperspacedev"
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Source code
                                    </Link>{" "}
                                    |{" "}
                                </span>
                            ) : null}
                            <Link
                                className={classes.welcomeLink}
                                href={
                                    this.state.license ??
                                    "https://thufie.lain.haus/NPL.html"
                                }
                                target="_blank"
                                rel="noreferrer"
                            >
                                License
                            </Link>{" "}
                            |
                            <Link
                                className={classes.welcomeLink}
                                href="https://github.com/hyperspacedev/hyperspace/issues/new"
                                target="_blank"
                                rel="noreferrer"
                            >
                                File an Issue
                            </Link>
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {this.state.brandName ?? "Hypersapce"} v.
                            {this.state.version}{" "}
                            {this.state.brandName &&
                            this.state.brandName !== "Hyperspace"
                                ? "(Hyperspace-like)"
                                : null}
                        </Typography>
                    </Paper>
                    {this.showAuthDialog()}
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(withSnackbar(WelcomePage));
