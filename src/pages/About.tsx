import React, { Component } from 'react';
import {
    List, 
    ListItem, 
    ListItemText, 
    ListSubheader, 
    ListItemSecondaryAction, 
    ListItemAvatar, 
    Avatar, 
    Paper, 
    IconButton, 
    withStyles, 
    Typography,
    Link
} from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import DomainIcon from '@material-ui/icons/Domain';
import ChatIcon from '@material-ui/icons/Chat';
import PersonIcon from '@material-ui/icons/Person';
import {styles} from './PageLayout.styles';

class AboutPage extends Component<any, any> {

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.pageLayoutConstraints}>
                <ListSubheader>About your instance</ListSubheader>
                <Paper className={classes.pageListConstraints}>
                    <List>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <DomainIcon/>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="Instance location (URL)" secondary="dreemurr.io"/>
                            <ListItemSecondaryAction>
                                <IconButton>
                                    <OpenInNewIcon/>
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar alt="Instance admin" src="https://preview.redd.it/wkdcm71za0i21.jpg?auto=webp&s=a59ce15710bf3bf5ab74bcce9d86055fd97c6102"/>
                            </ListItemAvatar>
                            <ListItemText primary="Instance admin" secondary="Toriel (@toriel)"/>
                            <ListItemSecondaryAction>
                                <IconButton>
                                    <ChatIcon/>
                                </IconButton>
                                <IconButton>
                                    <PersonIcon/>
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                </Paper>
                <br/>
                <ListSubheader>About this app</ListSubheader>
                <Paper className={classes.pageListConstraints}>
                    <List>
                        <ListItem>
                            <ListItemText primary="App version" secondary="Hyperspace v1.0.0"/>
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Release channel" secondary="Developer"/>
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="License" secondary="Apache 2.0 License (inherited)"/>
                        </ListItem>
                    </List>
                </Paper>
                <br/>
                <div>
                    <Typography variant="caption">(C) 2019 Hyperspace developers. All rights reserved.</Typography>
                    <Typography variant="caption" paragraph>Hyperspace is made possible by the <Link href={"https://material-ui.com"} target="_blank" rel="noreferrer">Material UI</Link> project, <Link href={"https://www.npmjs.com/package/megalodon"} target="_blank" rel="noreferrer">Megalodon</Link> library, and other <Link href={"https://github.com/hyperspacedev/hyperspace/blob/master/package.json"} target="_blank" rel="noreferrer">open source software</Link>.</Typography>
                </div>
            </div>
        );
    }

}

export default withStyles(styles)(AboutPage);