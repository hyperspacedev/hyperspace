import React, { Component } from 'react';
import {MuiThemeProvider, CssBaseline, withStyles, Typography } from '@material-ui/core';
import { setHyperspaceTheme } from './utilities/themes';
import { defaultTheme } from './types/HyperspaceTheme';
import AppLayout from './components/AppLayout';
import {styles} from './App.styles';
import {Route} from 'react-router-dom';

const theme = setHyperspaceTheme(defaultTheme);

class App extends Component<any, any> {

  render() {
    const { classes } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
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
        <Route path="/settings"/>
        <Route path="/about"/>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
