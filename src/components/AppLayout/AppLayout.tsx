import React, { Component } from 'react';
import { Typography, AppBar, Toolbar, IconButton, InputBase, Avatar, ListItemText, Divider, List, ListItem, ListItemIcon, Hidden, Drawer, ListSubheader, ListItemAvatar, withStyles } from '@material-ui/core';
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
import { Link } from 'react-router-dom';
import { ListItemProps } from '@material-ui/core/ListItem';
import { getCurrentUserData } from '../../utilities/accounts';
import { UAccount } from '../../types/Account';

interface IAppLayoutState {
    drawerOpenOnMobile: boolean;
    currentUser: UAccount;
}

interface ILinkableListItemProps extends ListItemProps {
  to: string;
  replace?: boolean;
}

const LinkableListItem = (props: ILinkableListItemProps) => (
  <ListItem {...props} component={Link as any}/>
)

export class AppLayout extends Component<any, IAppLayoutState> {
    constructor(props: any) {
        super(props);
    
        this.state = {
          drawerOpenOnMobile: false,
          currentUser: getCurrentUserData()
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
                  <LinkableListItem button key="profile-mobile" to="/profile">
                    <ListItemAvatar>
                      <Avatar alt="You" src={this.state.currentUser.avatar_static}/>
                    </ListItemAvatar>
                    <ListItemText primary={this.state.currentUser.display_name} secondary={this.state.currentUser.acct}/>
                  </LinkableListItem>
                  <LinkableListItem button key="notifications-mobile" to="/notifications">
                    <ListItemIcon><NotificationsIcon/></ListItemIcon>
                    <ListItemText primary="Notifications"/>
                  </LinkableListItem>
                  <LinkableListItem button key="messages-mobile" to="/messages">
                    <ListItemIcon><MailIcon/></ListItemIcon>
                    <ListItemText primary="Messages"/>
                  </LinkableListItem>
                  <LinkableListItem button key="acctSwitch-module" to="/switchacct">
                    <ListItemIcon><SupervisedUserCircleIcon/></ListItemIcon>
                    <ListItemText primary="Switch account"/>
                  </LinkableListItem>
                  <LinkableListItem button key="acctLogout-mobile" to="/logout">
                    <ListItemIcon><ExitToAppIcon/></ListItemIcon>
                    <ListItemText primary="Log out"/>
                  </LinkableListItem>
                  <Divider/>
                </div>
                <ListSubheader>Timelines</ListSubheader>
                <LinkableListItem button key="home" to="/home">
                  <ListItemIcon><HomeIcon/></ListItemIcon>
                  <ListItemText primary="Home"/>
                </LinkableListItem>
                <LinkableListItem button key="local" to="/local">
                  <ListItemIcon><DomainIcon/></ListItemIcon>
                  <ListItemText primary="Local"/>
                </LinkableListItem>
                <LinkableListItem button key="public" to="/public">
                  <ListItemIcon><PublicIcon/></ListItemIcon>
                  <ListItemText primary="Public"/>
                </LinkableListItem>
                <Divider/>
                <ListSubheader>More</ListSubheader>
                <LinkableListItem button key="recommended" to="/recommended">
                  <ListItemIcon><GroupIcon/></ListItemIcon>
                  <ListItemText primary="Who to follow"/>
                </LinkableListItem>
                <LinkableListItem button key="settings" to="/settings">
                  <ListItemIcon><SettingsIcon/></ListItemIcon>
                  <ListItemText primary="Settings"/>
                </LinkableListItem>
                <LinkableListItem button key="info" to="/about">
                  <ListItemIcon><InfoIcon/></ListItemIcon>
                  <ListItemText primary="About"/>
                </LinkableListItem>
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
                    <Avatar className={classes.appBarAcctMenuIcon} alt="You" src={this.state.currentUser.avatar_static}/>
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