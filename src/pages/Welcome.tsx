import React, { Component } from 'react';
import {withStyles, Paper, Typography, Button, TextField, Fade, Link, CircularProgress, Tooltip} from '@material-ui/core';
import {styles} from './WelcomePage.styles';
import Mastodon from 'megalodon';
import {SaveClientSession} from '../types/SessionData';
import { createHyperspaceApp } from '../utilities/login';
import {parseUrl} from 'query-string';
import { getConfig } from '../utilities/settings';
import axios from 'axios';

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
}

class WelcomePage extends Component<any, IWelcomeState> {

    client: any;

    constructor(props: any) {
        super(props);

        this.state = {
            wantsToLogin: false,
            user: "",
            userInputError: false,
            foundSavedLogin: false,
            authority: false,
            userInputErrorMessage: ''
        }

        getConfig().then((result: any) => {
            this.setState({
                logoUrl: result.branding? result.branding.logo: "logo.png",
                backgroundUrl: result.branding? result.branding.background: "background.png",
                brandName: result.branding? result.branding.name: "Hyperspace",
                registerBase: result.registration? result.registration.defaultInstance: "",
                federates: result.federated? result.federated === "true": true
            });
        }).catch(() => {
            console.warn('config.json is missing. If you want to customize Hyperspace, please include config.json');
        })
    }

    componentDidMount() {
        if (localStorage.getItem("login")) {
            this.setState({
                foundSavedLogin: true
            })
            this.getSavedSession();
            this.checkForToken();
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
                console.log(clientLoginSession);
                Mastodon.fetchAccessToken(
                    clientLoginSession.clientId,
                    clientLoginSession.clientSecret,
                    code,
                    (localStorage.getItem("baseurl") as string),
                    `https://${window.location.host}`,
                ).then((tokenData: any) => {
                    localStorage.setItem("access_token", tokenData.access_token);
                    window.location.href=`https://${window.location.host}/#/`;
                }).catch((err: Error) => {
                    console.log(err.message);
                })
            }
        }
    }

    updateUserInfo(user: string) {
        this.setState({ user });
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

    startRegistration() {
        if (this.state.registerBase) {
            return "https://" + this.state.registerBase + "/auth/sign_up";
        } else {
            return "https://joinmastodon.org/#getting-started";
        }
    }

    startLogin() {
        if (this.state.user != "") {
            const scopes = 'read write follow';
            const baseurl = this.getLoginUser(this.state.user);
            localStorage.setItem("baseurl", baseurl);
            createHyperspaceApp(scopes, baseurl, `https://${window.location.host}`).then((resp: any) => {
                let saveSessionForCrashing: SaveClientSession = {
                    clientId: resp.clientId,
                    clientSecret: resp.clientSecret,
                    authUrl: resp.url
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
            this.setState({ userInputError: true });
        }
    }

    resumeLogin() {
        let loginData = localStorage.getItem("login");
        if (loginData) {
            let session: SaveClientSession = JSON.parse(loginData);
            this.setState({
                clientId: session.clientId,
                clientSecret: session.clientSecret,
                authUrl: session.authUrl,
                wantsToLogin: true
            })
        }
    }

    getSavedSession() {
        let loginData = localStorage.getItem("login");
        if (loginData) {
            let session: SaveClientSession = JSON.parse(loginData);
            this.setState({
                clientId: session.clientId,
                clientSecret: session.clientSecret,
                authUrl: session.authUrl
            })
        }
    }

    checkForErrors() {
        let userInputError = false;
        let userInputErrorMessage = "";

        if (this.state.user === "") {
            userInputError = true;
            userInputErrorMessage = "Field cannot be blank.";
            this.setState({ userInputError, userInputErrorMessage });
        } else {
            if (this.state.user.includes("@")) {
                let baseUrl = this.state.user.split("@")[1];
                axios.get("https://" + baseUrl + "/api/v1/timelines/public").catch((err: Error) => {
                    let userInputError = true;
                    let userInputErrorMessage = "Invalid instance name";
                    this.setState({ userInputError, userInputErrorMessage });
                })
            } else {
                this.setState({ userInputError, userInputErrorMessage });
            }
        }
        
    }

    readyForAuth() {
        if (localStorage.getItem('baseurl')) {
            return true;
        } else {
            return false;
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
                        <Tooltip title="Create a new account. You'll be redirected to a sign up page.">
                            <Button
                                color="primary"
                                href={this.startRegistration()}
                                target="_blank"
                                rel="noreferrer"
                            >Create account</Button>
                        </Tooltip>
                        <div className={classes.flexGrow}/>
                        <Button color="primary" variant="contained" onClick={() => this.startLogin()}>Next</Button>
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
                            Authorize
                        </Button>
                        <div className={classes.flexGrow}/>
                    </div>
                    <div className={classes.middlePadding}/>
                </div>
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
                    &copy; 2019 <Link href="https://hyperspace.marquiskurt.net" target="_blank" rel="noreferrer">Hyperspace</Link> developers. All rights reserved.
                </Typography>
                <Typography variant="caption">
                    <Link href="https://github.com/hyperspacedev" target="_blank" rel="noreferrer">GitHub</Link> | <Link href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noreferrer">License</Link> | <Link href="https://github.com/hyperspacedev/hyperspace/issues/new" target="_blank" rel="noreferrer">File an Issue</Link>
                </Typography>
            </Paper>
        </div>
        );
    }
}

export default withStyles(styles)(WelcomePage);