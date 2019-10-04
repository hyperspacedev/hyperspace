import { Theme, createStyles } from "@material-ui/core";

export const styles = (theme: Theme) =>
    createStyles({
        root: {
            width: "100%",
            height: "100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            top: 0,
            left: 0,
            position: "absolute",
            [theme.breakpoints.up("sm")]: {
                paddingTop: theme.spacing.unit * 4,
                paddingLeft: "25%",
                paddingRight: "25%"
            },
            [theme.breakpoints.up("lg")]: {
                paddingTop: theme.spacing.unit * 12,
                paddingLeft: "35%",
                paddingRight: "35%"
            }
        },
        titleBarRoot: {
            top: 0,
            left: 0,
            height: 40,
            width: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            textAlign: "center",
            zIndex: 1000,
            verticalAlign: "middle",
            WebkitUserSelect: "none",
            WebkitAppRegion: "drag",
            position: "absolute"
        },
        titleBarText: {
            color: theme.palette.common.white,
            fontSize: 12,
            paddingTop: 10,
            paddingBottom: 1
        },
        paper: {
            height: "100%",
            [theme.breakpoints.up("sm")]: {
                height: "auto",
                paddingLeft: theme.spacing.unit * 8,
                paddingRight: theme.spacing.unit * 8,
                paddingTop: theme.spacing.unit * 6
            },
            paddingTop: theme.spacing.unit * 12,
            paddingLeft: theme.spacing.unit * 4,
            paddingRight: theme.spacing.unit * 4,
            paddingBottom: theme.spacing.unit * 6,
            textAlign: "center"
        },
        welcomeLink: {
            color: theme.palette.primary.light
        },
        flexGrow: {
            flexGrow: 1
        },
        middlePadding: {
            height: theme.spacing.unit * 6
        },
        logo: {
            [theme.breakpoints.up("sm")]: {
                height: 64,
                width: "auto"
            }
        }
    });
