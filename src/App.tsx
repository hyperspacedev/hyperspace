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
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
