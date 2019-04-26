import React, { Component } from 'react';
import {withStyles, Paper, Typography, Button, TextField, Fade, Link, CircularProgress, Tooltip, Dialog, DialogTitle, DialogActions, DialogContent} from '@material-ui/core';
import {styles} from './WelcomePage.styles';
import Mastodon from 'megalodon';
import {SaveClientSession} from '../types/SessionData';
import { createHyperspaceApp } from '../utilities/login';
import {parseUrl} from 'query-string';
import { getConfig } from '../utilities/settings';
import axios from 'axios';
import {withSnackbar, withSnackbarProps} from 'notistack';

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
            emergencyMode: false
        }

        getConfig().then((result: any) => {
            if (result.location === "dynamic") {
                console.warn("Recirect URI is set to dyanmic, which may affect how sign-in works for some users. Careful!");
            }
            this.setState({
                logoUrl: result.branding? result.branding.logo: "logo.png",
                backgroundUrl: result.branding? result.branding.background: "background.png",
                brandName: result.branding? result.branding.name: "Hyperspace",
                registerBase: result.registration? result.registration.defaultInstance: "",
                federates: result.federated? result.federated === "true": true,
                license: result.license.url,
                repo: result.repository,
                defaultRedirectAddress: result.location != "dynamic"? result.location: `https://${window.location.host}`
            });
        }).catch(() => {
            console.error('config.json is missing. If you want to customize Hyperspace, please include config.json');
        })
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

    componentDidMount() {
        if (localStorage.getItem("login")) {
            this.getSavedSession();
            this.setState({
                foundSavedLogin: true
            })
            this.checkForToken();
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

    getLoginUser(user: string) {
        if (user.includes("@")) {
            let newUser = user;
            this.setState({ user: newUser })
            return "https://" + newUser.split("@")[1];
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
            createHyperspaceApp(scopes, baseurl, this.state.defaultRedirectAddress).then((resp: any) => {
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
        Mastodon.registerApp(this.state.brandName? this.state.brandName: "Hyperspace", {
            scopes: scopes
        }, baseurl).then((appData: any) => {
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
        window.location.href = `/?code=${this.state.authCode}#/`;
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
                let baseUrl = this.state.user.split("@")[1];
                axios.get("https://" + baseUrl + "/api/v1/timelines/public").catch((err: Error) => {
                    let userInputError = true;
                    let userInputErrorMessage = "Instance name is invalid.";
                    this.setState({ userInputError, userInputErrorMessage });
                    return true;
                })
            } else {
                this.setState({ userInputError, userInputErrorMessage });
                return false;
            }
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
                            `https://${window.location.host}`,
                ).then((tokenData: any) => {
                    localStorage.setItem("access_token", tokenData.access_token);
                    window.location.href=`https://${window.location.host}/#/`;
                }).catch((err: Error) => {
                    this.props.enqueueSnackbar("Couldn't authorize Hyperspace: " + err.name, {variant: 'error'});
                    console.error(err.message);
                })
            }
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
                        label="Account name"
                        fullWidth
                        placeholder="example@mastodon.host"
                        onChange={(event) => this.updateUserInfo(event.target.value)}
                        error={this.state.userInputError}
                        onBlur={() => this.checkForErrors()}
                    ></TextField>
                    {
                        this.state.userInputError? <Typography color="error">{this.state.userInputErrorMessage}</Typography> : null
                    }
                    <br/>
                    {
                        this.state.registerBase? <Typography variant="caption">If you are from <b>{this.state.registerBase? this.state.registerBase: "noinstance"}</b>, sign in with your username.</Typography>: null
                    }
                    <br/>
                    {
                        this.state.foundSavedLogin? 
                            <Typography>
                                Signing in from a previous session? <Link onClick={() => this.resumeLogin()}>Continue login</Link>.
                            </Typography>: null
                    }
                    
                    <div className={classes.middlePadding}/>
                    <div style={{ display: "flex" }}>
                        <Tooltip title="Create account on site">
                            <Button
                                color="primary"
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
                    <Typography>To continue, finish signing in on your instance's website and authorize Hyperspace.</Typography>
                    <div className={classes.middlePadding}/>
                    <div style={{ display: "flex" }}>
                        <div className={classes.flexGrow}/>
                        <Button
                            color="primary"
                            variant="contained"
                            size="large"
                            href={this.state.authUrl? this.state.authUrl: ""}
                        >
                            <Typography color="textPrimary" variant="button">Authorize</Typography>
                        </Button>
                        <div className={classes.flexGrow}/>
                    </div>
                    <div className={classes.middlePadding}/>
                    <Typography>Having trouble signing in? <Link onClick={() => this.startEmergencyLogin()}>Sign in with a code.</Link></Typography>
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
                    &copy; {new Date().getFullYear()} {this.state.brandName && this.state.brandName !== "Hyperspace"? `${this.state.brandName} developers and the `: ""}<Link href="https://hyperspace.marquiskurt.net" target="_blank" rel="noreferrer">Hyperspace</Link> developers. All rights reserved.
                </Typography>
                <Typography variant="caption">
                { this.state.repo? <span><Link href={this.state.repo? this.state.repo: "https://github.com/hyperspacedev"} target="_blank" rel="noreferrer">Source code</Link>  | </span>: null}<Link href={this.state.license? this.state.license: "https://www.apache.org/licenses/LICENSE-2.0"} target="_blank" rel="noreferrer">License</Link> | <Link href="https://github.com/hyperspacedev/hyperspace/issues/new" target="_blank" rel="noreferrer">File an Issue</Link>
                </Typography>
            </Paper>
            {this.showAuthDialog()}
        </div>
        );
    }
}

export default withStyles(styles)(withSnackbar(WelcomePage));