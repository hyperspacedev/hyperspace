import React, { Component, ChangeEvent } from 'react';
import {withStyles, Paper, Typography, Button, TextField, Fade, Link, CircularProgress, Tooltip, Dialog, DialogTitle, DialogActions, DialogContent} from '@material-ui/core';
import {styles} from './WelcomePage.styles';
import Mastodon from 'megalodon';
import {SaveClientSession} from '../types/SessionData';
import { createHyperspaceApp, getRedirectAddress } from '../utilities/login';
import {parseUrl} from 'query-string';
import { getConfig } from '../utilities/settings';
import { isDarwinApp } from '../utilities/desktop';
import axios from 'axios';
import {withSnackbar, withSnackbarProps} from 'notistack';
import { Config } from '../types/Config';

interface IWelcomeProps extends withSnackbarProps {
    classes: any;
}

interface IWelcomeState {
    logoUrl?: string;
    backgroundUrl?: string;
    brandName?: string;
    registerBase?: string;
    federates?: boolean;
    wantsToLogin: boolean;
    user: string;
    userInputError: boolean;
    userInputErrorMessage: string;
    clientId?: string;
    clientSecret?: string;
    authUrl?: string;
    foundSavedLogin: boolean;
    authority: boolean;
    license?: string;
    repo?: string;
    defaultRedirectAddress: string;
    openAuthDialog: boolean;
    authCode: string;
    emergencyMode: boolean;
    version: string;
}

class WelcomePage extends Component<IWelcomeProps, IWelcomeState> {

    client: any;

    constructor(props: any) {
        super(props);

        this.state = {
            wantsToLogin: false,
            user: "",
            userInputError: false,
            foundSavedLogin: false,
            authority: false,
            userInputErrorMessage: '',
            defaultRedirectAddress: '',
            openAuthDialog: false,
            authCode: '',
            emergencyMode: false,
            version: ''
        }

        getConfig().then((result: any) => {
            if (result !== undefined) {
                let config: Config = result;
                if (result.location === "dynamic") {
                    console.warn("Recirect URI is set to dynamic, which may affect how sign-in works for some users. Careful!");
                }
                    this.setState({
                        logoUrl: config.branding? result.branding.logo: "logo.png",
                        backgroundUrl: config.branding? result.branding.background: "background.png",
                        brandName: config.branding? result.branding.name: "Hyperspace",
                        registerBase: config.registration? result.registration.defaultInstance: "",
                        federates: config.federation.universalLogin,
                        license: config.license.url,
                        repo: config.repository,
                        defaultRedirectAddress: config.location != "dynamic"? config.location: `https://${window.location.host}`,
                        version: config.version
                    });
                }
        }).catch(() => {
            console.error('config.json is missing. If you want to customize Hyperspace, please include config.json');
        })
    }

    componentDidMount() {
        if (localStorage.getItem("login")) {
            this.getSavedSession();
            this.setState({
                foundSavedLogin: true
            })
            this.checkForToken();
        }
    }

    updateUserInfo(user: string) {
        this.setState({ user });
    }

    updateAuthCode(code: string) {
        this.setState({ authCode: code });
    }

    toggleAuthDialog() {
        this.setState({ openAuthDialog: !this.state.openAuthDialog });
    }

    readyForAuth() {
        if (localStorage.getItem('baseurl')) {
            return true;
        } else {
            return false;
        }
    }

    getSavedSession() {
        let loginData = localStorage.getItem("login");
        if (loginData) {
            let session: SaveClientSession = JSON.parse(loginData);
            this.setState({
                clientId: session.clientId,
                clientSecret: session.clientSecret,
                authUrl: session.authUrl,
                emergencyMode: session.emergency
            })
        }
    }

    startEmergencyLogin() {
        if (!this.state.emergencyMode) {
            this.createEmergencyLogin();
        };
        this.toggleAuthDialog();
    }

    startRegistration() {
        if (this.state.registerBase) {
            return "https://" + this.state.registerBase + "/auth/sign_up";
        } else {
            return "https://joinmastodon.org/#getting-started";
        }
    }

    watchUsernameField(event: any) {
        if (event.keyCode === 13)
            this.startLogin()
    }

    watchAuthField(event: any) {
        if (event.keyCode === 13)
            this.authorizeEmergencyLogin()
    }

    getLoginUser(user: string) {
        if (user.includes("@")) {
            if (this.state.federates) {
                let newUser = user;
                this.setState({ user: newUser });
                return "https://" + newUser.split("@")[1];
            } else {
                let newUser = `${user}@${this.state.registerBase? this.state.registerBase: "mastodon.social"}`;
                this.setState({ user: newUser });
                return "https://" + (this.state.registerBase? this.state.registerBase: "mastodon.social");
            }
        } else {
            let newUser = `${user}@${this.state.registerBase? this.state.registerBase: "mastodon.social"}`;
            this.setState({ user: newUser });
            return "https://" + (this.state.registerBase? this.state.registerBase: "mastodon.social");
        }
    }

    startLogin() {
        let error = this.checkForErrors();
        if (!error) {
            const scopes = 'read write follow';
            const baseurl = this.getLoginUser(this.state.user);
            localStorage.setItem("baseurl", baseurl);
            createHyperspaceApp(
                this.state.brandName? this.state.brandName: "Hyperspace", 
                scopes, 
                baseurl, 
                getRedirectAddress(this.state.defaultRedirectAddress)
            ).then((resp: any) => {
                let saveSessionForCrashing: SaveClientSession = {
                    clientId: resp.clientId,
                    clientSecret: resp.clientSecret,
                    authUrl: resp.url,
                    emergency: false
                }
                localStorage.setItem("login", JSON.stringify(saveSessionForCrashing));
                this.setState({
                    clientId: resp.clientId,
                    clientSecret: resp.clientSecret,
                    authUrl: resp.url,
                    wantsToLogin: true
                })
            })
        } else {
            
        }
    }

    createEmergencyLogin() {
        console.log("Creating an emergency login...")
        const scopes = "read write follow";
        const baseurl = localStorage.getItem('baseurl') || this.getLoginUser(this.state.user);
        Mastodon.registerApp(
            this.state.brandName? this.state.brandName: "Hyperspace", 
            {
                scopes: scopes
            }, 
            baseurl
        ).then((appData: any) => {
            let saveSessionForCrashing: SaveClientSession = {
                clientId: appData.clientId,
                clientSecret: appData.clientSecret,
                authUrl: appData.url,
                emergency: true
            };
            localStorage.setItem("login", JSON.stringify(saveSessionForCrashing));
            this.setState({
                clientId: appData.clientId,
                clientSecret: appData.clientSecret,
                authUrl: appData.url
            });
        });
    }

    authorizeEmergencyLogin() {
        window.location.href = `${this.state.defaultRedirectAddress}/?code=${this.state.authCode}#/`;
    }

    resumeLogin() {
        let loginData = localStorage.getItem("login");
        if (loginData) {
            let session: SaveClientSession = JSON.parse(loginData);
            this.setState({
                clientId: session.clientId,
                clientSecret: session.clientSecret,
                authUrl: session.authUrl,
                emergencyMode: session.emergency,
                wantsToLogin: true
            })
        }
    }

    checkForErrors(): boolean {
        let userInputError = false;
        let userInputErrorMessage = "";

        if (this.state.user === "") {
            userInputError = true;
            userInputErrorMessage = "Username cannot be blank.";
            this.setState({ userInputError, userInputErrorMessage });
            return true;
        } else {
            if (this.state.user.includes("@")) {
                if (this.state.federates && (this.state.federates === true)) {
                    let baseUrl = this.state.user.split("@")[1];
                    axios.get("https://" + baseUrl + "/api/v1/timelines/public").catch((err: Error) => {
                        let userInputError = true;
                        let userInputErrorMessage = "Instance name is invalid.";
                        this.setState({ userInputError, userInputErrorMessage });
                        return true;
                    });
                } else if (this.state.user.includes(this.state.registerBase? this.state.registerBase: "mastodon.social")) {
                    this.setState({ userInputError, userInputErrorMessage });
                    return false;
                } else {
                    userInputError = true;
                    userInputErrorMessage = "You cannot sign in with this username.";
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

    checkForToken() {
        let location = window.location.href;
        if (location.includes("?code=")) {
            let code = parseUrl(location).query.code as string;
            this.setState({ authority: true });
            let loginData = localStorage.getItem("login");
            if (loginData) {
                let clientLoginSession: SaveClientSession = JSON.parse(loginData);
                Mastodon.fetchAccessToken(
                    clientLoginSession.clientId,
                    clientLoginSession.clientSecret,
                    code,
                    (localStorage.getItem("baseurl") as string),
                    this.state.emergencyMode? 
                        undefined:
                        clientLoginSession.authUrl.includes("urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob")?
                            undefined: 
                            window.location.protocol === "hyperspace:"? "hyperspace://hyperspace/app/": `https://${window.location.host}`,
                ).then((tokenData: any) => {
                    localStorage.setItem("access_token", tokenData.access_token);
                    window.location.href = window.location.protocol === "hyperspace:"? "hyperspace://hyperspace/app/": `https://${window.location.host}/#/`;
                }).catch((err: Error) => {
                    this.props.enqueueSnackbar(`Couldn't authorize ${this.state.brandName? this.state.brandName: "Hyperspace"}: ${err.name}`, {variant: 'error'});
                    console.error(err.message);
                })
            }
        }
    }

    titlebar() {
        const { classes } = this.props;
        if (isDarwinApp()) {
          return (
            <div className={classes.titleBarRoot}>
              <Typography className={classes.titleBarText}>{this.state.brandName? this.state.brandName: "Hyperspace"}</Typography>
            </div>
          );
        }
      }

    showLanding() {
        const { classes } = this.props;
        return (
                <div>
                    <Typography variant="h5">Sign in</Typography>
                    <Typography>with your Mastodon account</Typography>
                    <div className={classes.middlePadding}/>
                    <TextField
                        variant="outlined"
                        label="Username"
                        fullWidth
                        placeholder="example@mastodon.example"
                        onChange={(event) => this.updateUserInfo(event.target.value)}
                        onKeyDown={(event) => this.watchUsernameField(event)}
                        error={this.state.userInputError}
                        onBlur={() => this.checkForErrors()}
                    ></TextField>
                    {
                        this.state.userInputError? <Typography color="error">{this.state.userInputErrorMessage}</Typography> : null
                    }
                    <br/>
                    {
                        this.state.registerBase && this.state.federates? <Typography variant="caption">Not from <b>{this.state.registerBase? this.state.registerBase: "noinstance"}</b>? Sign in with your <Link href="https://docs.joinmastodon.org/usage/decentralization/#addressing-people" target="_blank" rel="noopener noreferrer" color="secondary">full username</Link>.</Typography>: null
                    }
                    <br/>
                    {
                        this.state.foundSavedLogin? 
                            <Typography>
                                Signing in from a previous session? <Link className={classes.welcomeLink} onClick={() => this.resumeLogin()}>Continue login</Link>.
                            </Typography>: null
                    }
                    
                    <div className={classes.middlePadding}/>
                    <div style={{ display: "flex" }}>
                        <Tooltip title="Create account on site">
                            <Button
                                href={this.startRegistration()}
                                target="_blank"
                                rel="noreferrer"
                            >Create account</Button>
                        </Tooltip>
                        <div className={classes.flexGrow}/>
                        <Tooltip title="Continue sign-in">
                            <Button color="primary" variant="contained" onClick={() => this.startLogin()}>Next</Button>
                        </Tooltip>
                        
                    </div>
                </div>
        );
    }

    showLoginAuth() {
        const { classes } = this.props;
        return (
                <div>
                    <Typography variant="h5">Howdy, {this.state.user? this.state.user.split("@")[0]: "user"}</Typography>
                    <Typography>To continue, finish signing in on your instance's website and authorize {this.state.brandName? this.state.brandName: "Hyperspace"}.</Typography>
                    <div className={classes.middlePadding}/>
                    <div style={{ display: "flex" }}>
                        <div className={classes.flexGrow}/>
                        <Button
                            color="primary"
                            variant="contained"
                            size="large"
                            href={this.state.authUrl? this.state.authUrl: ""}
                        >
                            Authorize
                        </Button>
                        <div className={classes.flexGrow}/>
                    </div>
                    <div className={classes.middlePadding}/>
                    <Typography>Having trouble signing in? <Link onClick={() => this.startEmergencyLogin()} className={classes.welcomeLink}>Sign in with a code.</Link></Typography>
                </div>
        );
    }

    showAuthDialog() {
        const {classes} = this.props;
        return (
            <Dialog
                open={this.state.openAuthDialog}
                disableBackdropClick
                disableEscapeKeyDown
                maxWidth="sm"
                fullWidth={true}
            >
                <DialogTitle>
                    Authorize with a code
                </DialogTitle>
                <DialogContent>
                    <Typography paragraph>
                        If you're having trouble authorizing Hyperspace, you can manually request for an authorization code. Click 'Request Code' and then paste the code in the authorization code box to continue.
                    </Typography>
                    <Button
                        color="primary" 
                        variant="contained" 
                        href={this.state.authUrl? this.state.authUrl: ""}
                        target="_blank"
                        rel="noopener noreferrer"
                    >Request Code</Button>
                    <br/><br/>
                    <TextField
                        variant="outlined"
                        label="Authorization code"
                        fullWidth
                        onChange={(event) => this.updateAuthCode(event.target.value)}
                        onKeyDown={(event) => this.watchAuthField(event)}
                    ></TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.toggleAuthDialog()}>Cancel</Button>
                    <Button color="secondary" onClick={() => this.authorizeEmergencyLogin()}>Authorize</Button>
                </DialogActions>
            </Dialog>
        );
    }

    showAuthority() {
        const { classes } = this.props;
        return (
                <div>
                    <Typography variant="h5">Authorizing</Typography>
                    <Typography>Please wait while Hyperspace authorizes with Mastodon. This shouldn't take long...</Typography>
                    <div className={classes.middlePadding}/>
                    <div style={{ display: "flex" }}>
                        <div className={classes.flexGrow}/>
                            <CircularProgress/>
                        <div className={classes.flexGrow}/>
                    </div>
                    <div className={classes.middlePadding}/>
                </div>
        );
    }

    render() {
        const { classes } = this.props;
        return (
            <div>
                {this.titlebar()}
                <div className={classes.root} style={{ backgroundImage: `url(${this.state !== null? this.state.backgroundUrl: "background.png"})`}}>
                    <Paper className={classes.paper}>
                        <img className={classes.logo} alt={this.state? this.state.brandName: "Hyperspace"} src={this.state? this.state.logoUrl: "logo.png"}/>
                        <br/>
                        <Fade in={true}>
                            { 
                                this.state.authority?
                                    this.showAuthority():
                                        this.state.wantsToLogin?
                                            this.showLoginAuth():
                                            this.showLanding()
                            }
                        </Fade>
                        <br/>
                        <Typography variant="caption">
                            &copy; {new Date().getFullYear()} {this.state.brandName && this.state.brandName !== "Hyperspace"? `${this.state.brandName} developers and the `: ""} <Link className={classes.welcomeLink} href="https://hyperspace.marquiskurt.net" target="_blank" rel="noreferrer">Hyperspace</Link> developers. All rights reserved.
                        </Typography>
                        <Typography variant="caption">
                        { this.state.repo? <span>
                            <Link className={classes.welcomeLink} href={this.state.repo? this.state.repo: "https://github.com/hyperspacedev"} target="_blank" rel="noreferrer">Source code</Link>  | </span>: null}
                            <Link className={classes.welcomeLink} href={this.state.license? this.state.license: "https://www.apache.org/licenses/LICENSE-2.0"} target="_blank" rel="noreferrer">License</Link> | 
                            <Link className={classes.welcomeLink} href="https://github.com/hyperspacedev/hyperspace/issues/new" target="_blank" rel="noreferrer">File an Issue</Link>
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {this.state.brandName? this.state.brandName: "Hypersapce"} v.{this.state.version} {this.state.brandName && this.state.brandName !== "Hyperspace"? "(Hyperspace-like)": null}
                        </Typography>
                    </Paper>
                    {this.showAuthDialog()}
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(withSnackbar(WelcomePage));