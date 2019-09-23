import { Theme, createStyles } from "@material-ui/core";
import { isDarwinApp } from "./utilities/desktop";

export const styles = (theme: Theme) =>
    createStyles({
        root: {
            width: "100%",
            display: "flex",
            height: "100%",
            minHeight: "100vh",
            backgroundColor: isDarwinApp()
                ? "transparent"
                : theme.palette.background.default
        },
        content: {
            marginTop: 72,
            flexGrow: 1,
            padding: theme.spacing.unit * 3,
            [theme.breakpoints.up("md")]: {
                marginLeft: 250,
                marginTop: 88
            }
        }
    });
