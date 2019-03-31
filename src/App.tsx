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
import NotificationsPage from './pages/Notifications';
import {withSnackbar} from 'notistack';
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

  render() {
    const { classes } = this.props;
    
    return (
      <MuiThemeProvider theme={this.state.theme}>
        <CssBaseline/>
        <AppLayout/>
        <Route exact path="/" component={HomePage}/>
        <Route path="/home" component={HomePage}/>
        <Route path="/local" component={LocalPage}/>
        <Route path="/public" component={PublicPage}/>
        <Route path="/messages"/>
        <Route path="/notifications" component={NotificationsPage}/>
        <Route path="/profile/:profileId" render={props => <ProfilePage {...props}></ProfilePage>}/>
        <Route path="/conversation/:conversationId"/>
        <Route path="/settings" component={Settings}/>
        <Route path="/about" component={AboutPage}/>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(withSnackbar(App));
