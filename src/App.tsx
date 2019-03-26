import React, { Component } from 'react';
import {MuiThemeProvider, CssBaseline, withStyles, Typography } from '@material-ui/core';
import { setHyperspaceTheme } from './utilities/themes';
import { defaultTheme } from './types/HyperspaceTheme';
import AppLayout from './components/AppLayout';
import {styles} from './App.styles';

const theme = setHyperspaceTheme(defaultTheme);

class App extends Component<any, any> {

  render() {
    const { classes } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline/>
        <AppLayout/>
        <div className={classes.content}>
          <Typography variant="h3">Welcome to Hyperspace</Typography>
          <br/>
          <Typography paragraph>Here is where routed content should go so that it fits inside of AppLayout.</Typography>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
