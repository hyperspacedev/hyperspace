import React, { Component } from 'react';
import { withStyles, createStyles, Theme } from '@material-ui/core/styles';
import { setHyperspaceTheme } from './utilities/themes';
import { defaultTheme } from './types/HyperspaceTheme';
import { Typography, MuiThemeProvider } from '@material-ui/core';

const theme = setHyperspaceTheme(defaultTheme);

const styles = (theme: Theme) => createStyles({
  root: {
    width: '100%'
  }
});

class App extends Component<any, any> {
  render() {
    const { classes } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.root}>
          <Typography variant="h4">Bing!</Typography>
          <br/>
          <Typography variant="body1" paragraph> Thus the app should be ready to be deployed at any moment.</Typography>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
