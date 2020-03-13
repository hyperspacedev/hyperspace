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
import TimelinePage from "./pages/Timeline";
import Conversation from "./pages/Conversation";
import NotificationsPage from "./pages/Notifications";
import AnnouncementsPage from "./pages/Announcements";
import SearchPage from "./pages/Search";
import Composer from "./pages/Compose";
import WelcomePage from "./pages/Welcome";
import MessagesPage from "./pages/Messages";
import RecommendationsPage from "./pages/Recommendations";
import Missingno from "./pages/Missingno";
import Blocked from "./pages/Blocked";
import You from "./pages/You";
import RequestsPage from "./pages/Requests";
import ActivityPage from "./pages/Activity";
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
                    <PrivateRoute
                        exact
                        path="/"
                        render={(props: any) => (
                            <TimelinePage
                                {...props}
                                stream="/streaming/user"
                                timeline="/timelines/home"
                            />
                        )}
                    />
                    <PrivateRoute
                        path="/home"
                        render={(props: any) => (
                            <TimelinePage
                                {...props}
                                stream="/streaming/user"
                                timeline="/timelines/home"
                            />
                        )}
                    />
                    <PrivateRoute
                        path="/local"
                        render={(props: any) => (
                            <TimelinePage
                                {...props}
                                stream="/streaming/public/local"
                                timeline="/timelines/public?local=true"
                            />
                        )}
                    />
                    <PrivateRoute
                        path="/public"
                        render={(props: any) => (
                            <TimelinePage
                                {...props}
                                stream="/streaming/public"
                                timeline="/timelines/public"
                            />
                        )}
                    />
                    <PrivateRoute path="/messages" component={MessagesPage} />
                    <PrivateRoute
                        path="/announcements"
                        component={AnnouncementsPage}
                    />
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
                    <PrivateRoute path="/requests" component={RequestsPage} />
                    <PrivateRoute path="/activity" component={ActivityPage} />
                </div>
            </MuiThemeProvider>
        );
    }
}

// @ts-ignore
export default withStyles(styles)(withSnackbar(withRouter(App)));
