import React, { Component } from 'react';
import {MuiThemeProvider, CssBaseline, withStyles } from '@material-ui/core';
import { setHyperspaceTheme, darkMode } from './utilities/themes';
import AppLayout from './components/AppLayout';
import {styles} from './App.styles';
import {Route} from 'react-router-dom';
import AboutPage from './pages/About';
import Settings from './pages/Settings';
import { getUserDefaultBool, getUserDefaultTheme } from './utilities/settings';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/Home';
import LocalPage from './pages/Local';
import PublicPage from './pages/Public';
import Conversation from './pages/Conversation';
import NotificationsPage from './pages/Notifications';
import SearchPage from './pages/Search';
import Composer from './pages/Compose';
import WelcomePage from './pages/Welcome';
import MessagesPage from './pages/Messages';
import RecommendationsPage from './pages/Recommendations';
import Missingno from './pages/Missingno';
import You from './pages/You';
import {withSnackbar} from 'notistack';
import {PrivateRoute} from './interfaces/overrides';
import { userLoggedIn } from './utilities/accounts';
import { isDarwinApp } from './utilities/desktop';
let theme = setHyperspaceTheme(getUserDefaultTheme());

class App extends Component<any, any> {

  offline: any;

  constructor(props: any) {
    super(props);

    this.state = {
      theme: theme
    }
  }

  componentWillMount() {
    let newTheme = darkMode(this.state.theme, getUserDefaultBool('darkModeEnabled'));
    this.setState({ theme: newTheme });
  }

  componentDidMount() {
    this.removeBodyBackground()
  }

  componentDidUpdate() {
    this.removeBodyBackground()
  }

  removeBodyBackground() {
    if (isDarwinApp()) {
      document.body.style.backgroundColor = "transparent";
      console.log("Changed!")
      console.log(`New color: ${document.body.style.backgroundColor}`)
    }
  }

  render() {
    const { classes } = this.props;

    this.removeBodyBackground()
    
    return (
      <MuiThemeProvider theme={this.state.theme}>
        <CssBaseline/>
        <Route path="/welcome" component={WelcomePage}/>
          <div>
            { userLoggedIn()? <AppLayout/>: null}
            <PrivateRoute exact path="/" component={HomePage}/>
            <PrivateRoute path="/home" component={HomePage}/>
            <PrivateRoute path="/local" component={LocalPage}/>
            <PrivateRoute path="/public" component={PublicPage}/>
            <PrivateRoute path="/messages" component={MessagesPage}/>
            <PrivateRoute path="/notifications" component={NotificationsPage}/>
            <PrivateRoute path="/profile/:profileId" component={ProfilePage}/>
            <PrivateRoute path="/conversation/:conversationId" component={Conversation}/>
            <PrivateRoute path="/search" component={SearchPage}/>
            <PrivateRoute path="/settings" component={Settings}/>
            <PrivateRoute path="/you" component={You}/>
            <PrivateRoute path="/about" component={AboutPage}/>
            <PrivateRoute path="/compose" component={Composer}/>
            <PrivateRoute path="/recommended" component={RecommendationsPage}/>
          </div>

      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(withSnackbar(App));
