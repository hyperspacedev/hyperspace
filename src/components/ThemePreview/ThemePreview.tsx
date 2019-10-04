import React, { Component } from "react";
import {
    MuiThemeProvider,
    Theme,
    AppBar,
    Typography,
    CssBaseline,
    Toolbar,
    Fab,
    Paper
} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import MenuIcon from "@material-ui/icons/Menu";

interface IThemePreviewProps {
    theme: Theme;
}

interface IThemePreviewState {
    theme: Theme;
}

class ThemePreview extends Component<IThemePreviewProps, IThemePreviewState> {
    constructor(props: IThemePreviewProps) {
        super(props);

        this.state = {
            theme: this.props.theme
        };
    }

    render() {
        return (
            <div style={{ position: "relative" }}>
                <MuiThemeProvider theme={this.props.theme}>
                    <CssBaseline />
                    <Paper>
                        <AppBar color="primary" position="static">
                            <Toolbar>
                                <MenuIcon
                                    style={{ marginRight: 20, marginLeft: -4 }}
                                />
                                <Typography variant="h6" color="inherit">
                                    Hyperspace
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        <div
                            style={{
                                paddingLeft: 16,
                                paddingTop: 16,
                                paddingRight: 16,
                                paddingBottom: 16,
                                flexGrow: 1
                            }}
                        >
                            <Typography variant="h4" component="p">
                                This is your theme.
                            </Typography>
                            <br />
                            <Typography paragraph>
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Nunc vestibulum congue sem ac
                                ornare. In nec imperdiet neque. In eleifend
                                laoreet efficitur. Vestibulum vel odio mattis,
                                scelerisque nibh a, ornare lectus. Phasellus
                                sollicitudin erat et turpis pellentesque
                                consequat. In maximus luctus purus, eu molestie
                                elit euismod eu. Pellentesque quam lectus,
                                sagittis eget accumsan in, consequat ut sapien.
                                Morbi aliquet ligula erat, id dapibus nunc
                                laoreet at. Integer sodales lacinia finibus.
                                Aliquam augue nibh, eleifend quis consectetur
                                et, rhoncus ut odio. Lorem ipsum dolor sit amet,
                                consectetur adipiscing elit.
                            </Typography>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <Fab
                                color="secondary"
                                style={{ marginRight: 8, marginBottom: 8 }}
                            >
                                <EditIcon />
                            </Fab>
                        </div>
                    </Paper>
                </MuiThemeProvider>
            </div>
        );
    }
}

export default ThemePreview;
