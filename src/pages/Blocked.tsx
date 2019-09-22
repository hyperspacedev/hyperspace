import React, { Component } from "react";
import { styles } from "./PageLayout.styles";

import {
    Button,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    ListSubheader,
    Paper,
    Switch,
    withStyles
} from "@material-ui/core";
import DevicesIcon from "@material-ui/core/SvgIcon/SvgIcon";

class Blocked extends Component<any, any> {
    render() {
        const { classes } = this.props;
        return (
            <div className={classes.pageLayoutConstraints}>
                <ListSubheader>Blocked servers</ListSubheader>
                <Button className={classes.clearAllButton} variant="text">
                    {" "}
                    Add
                </Button>
                <Paper className={classes.pageListConstraints}>
                    <List>
                        <ListItem>
                            <ListItemAvatar>
                                <DevicesIcon color="action" />
                            </ListItemAvatar>
                            <ListItemText
                                primary="Match system appearance"
                                secondary="Obey light/dark theme from your system"
                            />
                        </ListItem>
                    </List>
                </Paper>
            </div>
        );
    }
}

export default withStyles(styles)(Blocked);
