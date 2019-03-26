import React, { Component } from 'react';
import { Typography, AppBar, Toolbar, IconButton, InputBase, Avatar, ListItemText, Divider, List, ListItem, ListItemIcon, Hidden, Drawer, ListSubheader, ListItemAvatar, Theme, createStyles, withStyles } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MailIcon from '@material-ui/icons/Mail';
import HomeIcon from '@material-ui/icons/Home';
import DomainIcon from '@material-ui/icons/Domain';
import PublicIcon from '@material-ui/icons/Public';
import GroupIcon from '@material-ui/icons/Group';
import SettingsIcon from '@material-ui/icons/Settings';
import InfoIcon from '@material-ui/icons/Info';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import {styles} from './AppLayout.styles';

interface IAppLayoutState {
    drawerOpenOnMobile: boolean;
}

export class AppLayout extends Component<any, IAppLayoutState> {
    constructor(props: any) {
        super(props);
    
        this.state = {
          drawerOpenOnMobile: false
        }
    
        this.toggleDrawerOnMobile = this.toggleDrawerOnMobile.bind(this);
      }

      toggleDrawerOnMobile() {
        this.setState({
          drawerOpenOnMobile: !this.state.drawerOpenOnMobile
        })
      }

      titlebar() {
        const { classes } = this.props;
        if (process.env.NODE_ENV === "development") {
          return (
            <div className={classes.titleBarRoot}>
              <Typography className={classes.titleBarText}>Careful: you're running Hyperspace in developer mode.</Typography>
            </div>
          );
        } else if ((navigator.userAgent.includes("Hyperspace") || navigator.userAgent.includes("Electron")) && navigator.userAgent.includes("Macintosh")) {
          return (
            <div className={classes.titleBarRoot}>
              <Typography className={classes.titleBarText}>Hyperspace</Typography>
            </div>
          );
        }
      }

      appDrawer() {
        const { classes } = this.props;
        return (
          <div>
              <List>
                <div className={classes.drawerDisplayMobile}>
                  <ListItem button key="profile-mobile">
                    <ListItemAvatar>
                      <Avatar alt="You" src="https://preview.redd.it/9a5zntent0g21.jpg?width=960&crop=smart&auto=webp&s=5668a0a2d3cb52e43a302aa3d0902ae0704c9dc1"/>
                    </ListItemAvatar>
                    <ListItemText primary="Asriel Dreemurr" secondary="@asriel@dreemurr.io"/>
                  </ListItem>
                  <ListItem button key="notifications-mobile">
                    <ListItemIcon><NotificationsIcon/></ListItemIcon>
                    <ListItemText primary="Notifications"/>
                  </ListItem>
                  <ListItem button key="messages-mobile">
                    <ListItemIcon><MailIcon/></ListItemIcon>
                    <ListItemText primary="Messages"/>
                  </ListItem>
                  <ListItem button key="acctSwitch-module">
                    <ListItemIcon><SupervisedUserCircleIcon/></ListItemIcon>
                    <ListItemText primary="Switch account"/>
                  </ListItem>
                  <ListItem button key="acctLogout-mobile">
                    <ListItemIcon><ExitToAppIcon/></ListItemIcon>
                    <ListItemText primary="Log out"/>
                  </ListItem>
                  <Divider/>
                </div>
                <ListSubheader>Timelines</ListSubheader>
                <ListItem button key="home">
                  <ListItemIcon><HomeIcon/></ListItemIcon>
                  <ListItemText primary="Home"/>
                </ListItem>
                <ListItem button key="local">
                  <ListItemIcon><DomainIcon/></ListItemIcon>
                  <ListItemText primary="Local"/>
                </ListItem>
                <ListItem button key="public">
                  <ListItemIcon><PublicIcon/></ListItemIcon>
                  <ListItemText primary="Public"/>
                </ListItem>
                <Divider/>
                <ListSubheader>More</ListSubheader>
                <ListItem button key="recommended">
                  <ListItemIcon><GroupIcon/></ListItemIcon>
                  <ListItemText primary="Who to follow"/>
                </ListItem>
                <ListItem button key="settings">
                  <ListItemIcon><SettingsIcon/></ListItemIcon>
                  <ListItemText primary="Settings"/>
                </ListItem>
                <ListItem button key="info">
                  <ListItemIcon><InfoIcon/></ListItemIcon>
                  <ListItemText primary="About"/>
                </ListItem>
              </List>
          </div>
          );
    }

    render() {
    const { classes } = this.props;
    return (
        <div className={classes.root}>
        <div className={classes.stickyArea}>
          {this.titlebar()}
          <AppBar className={classes.appBar} position="static">
            <Toolbar>
              <IconButton
                className={classes.appBarMenuButton} 
                color="inherit" 
                aria-label="Open drawer"
                onClick={this.toggleDrawerOnMobile}
              >
                <MenuIcon/>
              </IconButton>
              <Typography className={classes.appBarTitle} variant="h6" color="inherit" noWrap>
                Hyperspace
              </Typography>
              <div className={classes.appBarFlexGrow}/>
              <div className={classes.appBarSearch}>
                <div className={classes.appBarSearchIcon}>
                  <SearchIcon/>
                </div>
                <InputBase
                  placeholder="Search..."
                  classes={{
                    root: classes.appBarSearchInputRoot,
                    input: classes.appBarSearchInputInput
                  }}
                />
              </div>
              <div className={classes.appBarFlexGrow}/>
              <div className={classes.appBarActionButtons}>
                  <IconButton color="inherit">
                    <NotificationsIcon/>
                  </IconButton>
                  <IconButton color="inherit">
                    <MailIcon/>
                  </IconButton>
                  <IconButton>
                    <Avatar className={classes.appBarAcctMenuIcon} alt="You" src="https://preview.redd.it/9a5zntent0g21.jpg?width=960&crop=smart&auto=webp&s=5668a0a2d3cb52e43a302aa3d0902ae0704c9dc1"/>
                  </IconButton>
              </div>
            </Toolbar>
          </AppBar>
          <nav className={classes.drawer}>
            <Hidden mdUp implementation="css">
                <Drawer
                  container={this.props.container}
                  variant="temporary"
                  anchor={'left'}
                  open={this.state.drawerOpenOnMobile}
                  onClose={this.toggleDrawerOnMobile}
                  classes={{ paper: classes.drawerPaper }}
                >
                  {this.appDrawer()}
                </Drawer>
            </Hidden>
            <Hidden smDown implementation="css">
                <Drawer 
                  classes={{ 
                    paper: this.titlebar()? classes.drawerPaperWithTitleAndAppBar: classes.drawerPaperWithAppBar
                  }} 
                  variant="permanent" 
                  open
                >
                  {this.appDrawer()}
                </Drawer>
            </Hidden>
          </nav>
        </div>
    </div>
    );
  }
}

export default withStyles(styles)(AppLayout);