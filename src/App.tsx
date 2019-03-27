import React, { Component } from 'react';
import {MuiThemeProvider, CssBaseline, withStyles, Typography } from '@material-ui/core';
import { setHyperspaceTheme, darkMode } from './utilities/themes';
import { defaultTheme } from './types/HyperspaceTheme';
import AppLayout from './components/AppLayout';
import {styles} from './App.styles';
import {Route} from 'react-router-dom';
import AboutPage from './pages/About';
import Settings from './pages/Settings';
import { getUserDefaultBool, getUserDefaultTheme } from './utilities/settings';

let theme = setHyperspaceTheme(getUserDefaultTheme());
console.log(theme);
class App extends Component<any, any> {

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
        <Route exact path="/"/>
        <Route path="/home"/>
        <Route path="/local"/>
        <Route path="/public"/>
        <Route path="/messages"/>
        <Route path="/notifications"/>
        <Route path="/profile"/>
        <Route path="/conversation"/>
        <Route path="/settings" component={Settings}/>
        <Route path="/about" component={AboutPage}/>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
