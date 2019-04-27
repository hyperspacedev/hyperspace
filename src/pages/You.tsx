import React, {Component} from 'react';
import {withStyles, Typography, Paper, Avatar, Button, TextField} from '@material-ui/core';
import {withSnackbar, withSnackbarProps} from 'notistack';
import {styles} from './PageLayout.styles';

interface IYouProps extends withSnackbarProps {
    classes: any;
}

class You extends Component<IYouProps, any> {
    render() {
        const {classes} = this.props;
        return (
            <div className={classes.pageLayoutConstraints}>

            </div>
        );
    }
}

export default withStyles(styles)(withSnackbar(You));