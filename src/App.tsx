import React, { Component } from "react";
import { MuiThemeProvider, CssBaseline, withStyles } from "@material-ui/core";
import { setHyperspaceTheme, darkMode } from "./utilities/themes";
import AppLayout from "./components/AppLayout";
import { styles } from "./App.styles";
import { Route, withRouter } from "react-router-dom";
import AboutPage from "./pages/About";
import Settings from "./pages/Settings";
import { getUserDefaultBool, getUserDefaultTheme } from "./utilities/settings";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/Home";
import LocalPage from "./pages/Local";
import PublicPage from "./pages/Public";
import Conversation from "./pages/Conversation";
import NotificationsPage from "./pages/Notifications";
import SearchPage from "./pages/Search";
import Composer from "./pages/Compose";
import WelcomePage from "./pages/Welcome";
import MessagesPage from "./pages/Messages";
import RecommendationsPage from "./pages/Recommendations";
import Missingno from "./pages/Missingno";
import Blocked from "./pages/Blocked";
import You from "./pages/You";
import { withSnackbar } from "notistack";
import { PrivateRoute } from "./interfaces/overrides";
import { userLoggedIn } from "./utilities/accounts";
import { isDarwinApp } from "./utilities/desktop";
let theme = setHyperspaceTheme(getUserDefaultTheme());

interface IAppState {
    theme: any;
    showLayout: boolean;
}

class App extends Component<any, IAppState> {
    offline: any;
    unlisten: any;

    constructor(props: any) {
        super(props);

        this.state = {
            theme: theme,
            showLayout:
                userLoggedIn() && !window.location.hash.includes("#/welcome")
        };
    }

    componentWillMount() {
        let newTheme = darkMode(
            this.state.theme,
            getUserDefaultBool("darkModeEnabled")
        );
        this.setState({
            theme: newTheme,
            showLayout:
                userLoggedIn() && !window.location.hash.includes("#/welcome")
        });
    }

    componentDidMount() {
        this.removeBodyBackground();
        this.unlisten = this.props.history.listen(
            (location: Location, action: any) => {
                this.setState({
                    showLayout:
                        userLoggedIn() &&
                        !location.pathname.includes("/welcome")
                });
            }
        );
    }

    componentDidUpdate() {
        this.removeBodyBackground();
    }

    componentWillUnmount() {
        this.unlisten();
    }

    removeBodyBackground() {
        if (isDarwinApp()) {
            document.body.style.backgroundColor = "transparent";
        }
    }

    render() {
        const { classes } = this.props;

        this.removeBodyBackground();

        return (
            <MuiThemeProvider theme={this.state.theme}>
                <CssBaseline />
                <Route path="/welcome" component={WelcomePage} />
                <div>
                    {this.state.showLayout ? <AppLayout /> : null}
                    <PrivateRoute exact path="/" component={HomePage} />
                    <PrivateRoute path="/home" component={HomePage} />
                    <PrivateRoute path="/local" component={LocalPage} />
                    <PrivateRoute path="/public" component={PublicPage} />
                    <PrivateRoute path="/messages" component={MessagesPage} />
                    <PrivateRoute
                        path="/notifications"
                        component={NotificationsPage}
                    />
                    <PrivateRoute
                        path="/profile/:profileId"
                        component={ProfilePage}
                    />
                    <PrivateRoute
                        path="/conversation/:conversationId"
                        component={Conversation}
                    />
                    <PrivateRoute path="/search" component={SearchPage} />
                    <PrivateRoute path="/settings" component={Settings} />
                    <PrivateRoute path="/blocked" component={Blocked} />
                    <PrivateRoute path="/you" component={You} />
                    <PrivateRoute path="/about" component={AboutPage} />
                    <PrivateRoute path="/compose" component={Composer} />
                    <PrivateRoute
                        path="/recommended"
                        component={RecommendationsPage}
                    />
                </div>
            </MuiThemeProvider>
        );
    }
}

// @ts-ignore
export default withStyles(styles)(withSnackbar(withRouter(App)));
