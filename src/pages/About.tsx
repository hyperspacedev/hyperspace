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
    Link,
    Tooltip,
    Button
} from '@material-ui/core';

import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import ChatIcon from '@material-ui/icons/Chat';
import PersonIcon from '@material-ui/icons/Person';
import AssignmentIcon from '@material-ui/icons/Assignment';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import NetworkCheckIcon from '@material-ui/icons/NetworkCheck';
import UpdateIcon from '@material-ui/icons/Update';
import InfoIcon from '@material-ui/icons/Info';
import NotesIcon from '@material-ui/icons/Notes';
import CodeIcon from '@material-ui/icons/Code';
import TicketAccountIcon from 'mdi-material-ui/TicketAccount';
import MastodonIcon from 'mdi-material-ui/Mastodon';
import EditIcon from '@material-ui/icons/Edit';
import VpnKeyIcon from '@material-ui/icons/VpnKey';

import {styles} from './PageLayout.styles';
import {Instance} from '../types/Instance';
import {LinkableIconButton, LinkableAvatar} from '../interfaces/overrides';
import Mastodon from 'megalodon';
import { UAccount } from '../types/Account';
import { getConfig } from '../utilities/settings';
import { License, Federation } from '../types/Config';

interface IAboutPageState  {
    instance?: Instance;
    federated?: boolean;
    federation?: Federation;
    developer?: boolean;
    hyperspaceAdmin?: UAccount;
    hyperspaceAdminName?: string;
    versionNumber?: string;
    brandName?: string;
    brandBg?: string;
    license: License;
    repository?: string;
}

class AboutPage extends Component<any, IAboutPageState> {

    client: Mastodon;

    constructor(props: any) {
        super(props);

        this.client = new Mastodon(localStorage.getItem('access_token') as string, localStorage.getItem('baseurl') + "/api/v1");

        this.state = {
            license: {
                name: "Apache 2.0 License (inherited)",
                url: "https://www.apache.org/licenses/LICENSE-2.0"
            }
        }
    }

    componentWillMount() {
        this.client.get('/instance').then((resp: any) => {
            this.setState({
                instance: resp.data as Instance
            })
        })

        getConfig().then((config: any) => {
            this.client.get('/accounts/' + (config.admin? config.admin.account: "0")).then((resp: any) => {
                let account = resp.data;
                this.setState({
                    hyperspaceAdmin: account,
                    hyperspaceAdminName: config.admin.name,
                    federation: config.federation,
                    developer: config.developer? config.developer === "true": false,
                    versionNumber: config.version,
                    brandName: config.branding? config.branding.name: "Hyperspace",
                    brandBg: config.branding.background,
                    license: {
                        name: config.license.name,
                        url: config.license.url
                    },
                    repository: config.repository
                })
            }).catch((err: Error) => {
                console.error(err.message);
            })
        })
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.pageLayoutConstraints}>
                <Paper>
                    <div 
                        className={classes.instanceHeaderPaper}
                        style={{
                            backgroundImage: `url("${this.state.instance && this.state.instance.thumbnail? this.state.instance.thumbnail: ""}")`
                        }}
                    >
                        <IconButton className={classes.instanceToolbar} href={localStorage.getItem("baseurl") as string} target="_blank" rel="noreferrer" color="inherit">
                            <OpenInNewIcon/>
                        </IconButton>
                        <Typography className={classes.instanceHeaderText} variant="h4" component="p">{this.state.instance ? this.state.instance.uri: "Loading..."}</Typography>
                    </div>
                    <List className={classes.pageListConstraints}>
                        <ListItem>
                            <ListItemAvatar>
                                <LinkableAvatar to={`/profile/${this.state.instance? this.state.instance.contact_account.id: 0}`} alt="Instance admin" src={this.state.instance? this.state.instance.contact_account.avatar_static: ""}/>
                            </ListItemAvatar>
                            <ListItemText primary="Instance admin" secondary={
                                this.state.instance ? `${this.state.instance.contact_account.display_name} (@${this.state.instance.contact_account.acct})`:
                                "Loading..."
                            }/>
                            <ListItemSecondaryAction>
                                <Tooltip title="Send a post or message">
                                    <LinkableIconButton to={`/compose?visibility=public&acct=${this.state.instance? this.state.instance.contact_account.acct: ""}`}>
                                        <ChatIcon/>
                                    </LinkableIconButton>
                                </Tooltip>
                                <Tooltip title="View profile">
                                    <LinkableIconButton to={`/profile/${this.state.instance? this.state.instance.contact_account.id: 0}`}>
                                        <AssignmentIndIcon/>
                                    </LinkableIconButton>
                                </Tooltip>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <AssignmentIcon/>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary="Terms of service"
                                secondary="View the rules and privacy policies"
                            />
                            <ListItemSecondaryAction>
                                <Tooltip title="Open in browser">
                                    <IconButton href={localStorage.getItem("baseurl") as string + "/terms"} target="_blank" rel="noreferrer">
                                        <OpenInNewIcon/>
                                    </IconButton>
                                </Tooltip>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <TicketAccountIcon/>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary="Invite a friend"
                                secondary="Invite a friend to this instance"
                            />
                            <ListItemSecondaryAction>
                                <Tooltip title="Go to invite settings">
                                    <Button href={localStorage.getItem("baseurl") as string + "/invites"} target="_blank" rel="noreferrer">
                                        Invite
                                    </Button>
                                </Tooltip>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <MastodonIcon/>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary="Mastodon version"
                                secondary={this.state.instance? this.state.instance.version: "x.x.x"}
                            />
                        </ListItem>
                    </List>
                </Paper>
                
                <br/>

                <Paper>
                    <div 
                        className={classes.instanceHeaderPaper}
                        style={{
                            backgroundImage: `url("${this.state.brandBg? this.state.brandBg: ""}")`
                        }}
                    >
                        <div className={classes.instanceToolbar}>
                            {
                                this.state.repository?
                                <Tooltip title="View source code">
                                    <IconButton href={this.state.repository} target="_blank" rel="noreferrer" color="inherit">
                                        <CodeIcon/>
                                    </IconButton>
                                </Tooltip>: null
                            }
                        </div>
                        <Typography className={classes.instanceHeaderText} variant="h4" component="p">
                            {this.state.brandName? this.state.brandName: "Hyperspace"}
                        </Typography>
                    </div>
                    <List className={classes.pageListConstraints}>
                        <ListItem>
                            <ListItemAvatar>
                                <LinkableAvatar to={`/profile/${this.state.hyperspaceAdmin? this.state.hyperspaceAdmin.id: 0}`} src={this.state.hyperspaceAdmin? this.state.hyperspaceAdmin.avatar_static: ""}>
                                    <PersonIcon/>
                                </LinkableAvatar>
                            </ListItemAvatar>
                            <ListItemText primary="App provider" secondary={this.state.hyperspaceAdmin && this.state.hyperspaceAdminName? (this.state.hyperspaceAdminName || this.state.hyperspaceAdmin.display_name || "@" + this.state.hyperspaceAdmin.acct): "No provider set in config"}/>
                            <ListItemSecondaryAction>
                                <Tooltip title="Send a post or message">
                                    <LinkableIconButton to={`/compose?visibility=${this.state.federated? "public": "private"}&acct=${this.state.hyperspaceAdmin? this.state.hyperspaceAdmin.acct: ""}`}>
                                        <ChatIcon/>
                                    </LinkableIconButton>
                                </Tooltip>
                                <Tooltip title="View profile">
                                    <LinkableIconButton to={`/profile/${this.state.hyperspaceAdmin? this.state.hyperspaceAdmin.id: 0}`}>
                                        <AssignmentIndIcon/>
                                    </LinkableIconButton>
                                </Tooltip>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <NotesIcon/>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="License" secondary={this.state.license.name}/>
                            <ListItemSecondaryAction>
                                <Tooltip title = "View license">
                                    <IconButton href={this.state.license.url} target="_blank" rel="noreferrer">
                                        <OpenInNewIcon/>
                                    </IconButton>
                                </Tooltip>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <UpdateIcon/>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="Release channel" secondary={
                                this.state?
                                    this.state.developer?
                                        "Developer":
                                        "Release":
                                "Loading..."
                            }/>
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <InfoIcon/>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="App version" secondary={`${this.state? this.state.brandName: "Hyperspace"} v${this.state? this.state.versionNumber: "1.0.x"} ${this.state && this.state.brandName !== "Hyperspace"? "(Hyperspace-like)": ""}`}/>
                        </ListItem>
                    </List>
                </Paper>
                <br/>
                <ListSubheader>Federation status</ListSubheader>
                <Paper>
                    <List className={classes.pageListConstraints}>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <NetworkCheckIcon/>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="General federation" secondary={this.state.federation && this.state.federation.enablePublicTimeline? "This instance is federated.": "This instance is not federated."}/>
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <VpnKeyIcon/>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="Universal login" secondary={this.state.federation && this.state.federation.universalLogin? "This instance supports universal login.": "This instance does not support universal login."}/>
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <EditIcon/>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="Public posting" secondary={this.state.federation && this.state.federation.allowPublicPosts? "This instance allows posting publicly.": "This instance does not allow posting publicly."}/>
                        </ListItem>
                    </List>
                </Paper>
                <br/>
                <div className={classes.pageLayoutFooter}>
                    <Typography variant="caption">(C) {new Date().getFullYear()} {this.state? this.state.brandName: "Hyperspace"} developers. All rights reserved.</Typography>
                    <Typography variant="caption" paragraph>{this.state? this.state.brandName: "Hyperspace"} is made possible by the <Link href={"https://material-ui.com"} target="_blank" rel="noreferrer">Material UI</Link> project, <Link href={"https://www.npmjs.com/package/megalodon"} target="_blank" rel="noreferrer">Megalodon</Link> library, and other <Link href={"https://github.com/hyperspacedev/hyperspace/blob/master/package.json"} target="_blank" rel="noreferrer">open source software</Link>.</Typography>
                </div>
            </div>
        );
    }

}

export default withStyles(styles)(AboutPage);