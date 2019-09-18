import React, { Component } from "react";
import { withStyles, Typography } from "@material-ui/core";
import { styles } from "./PageLayout.styles";
import { LinkableButton } from "../interfaces/overrides";

class Missingno extends Component<any, any> {
    render() {
        const { classes } = this.props;
        return (
            <div className={classes.pageLayoutConstraints}>
                <div>
                    <Typography variant="h4" component="h1">
                        <b>Uh oh!</b>
                    </Typography>
                    <Typography variant="h6" component="p">
                        The part of Hyperspace you're looking for isn't here.
                    </Typography>
                    <br />
                    <LinkableButton
                        to="/home"
                        color="primary"
                        variant="contained"
                    >
                        Go back to home timeline
                    </LinkableButton>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(Missingno);
