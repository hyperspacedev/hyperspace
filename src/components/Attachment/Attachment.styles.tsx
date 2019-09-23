import { Theme, createStyles } from "@material-ui/core";

export const styles = (theme: Theme) =>
    createStyles({
        mediaContainer: {
            padding: theme.spacing.unit * 2
        },
        mediaObject: {
            width: "100%",
            height: "100%"
        },
        mediaSlide: {
            backgroundColor: theme.palette.primary.light,
            width: "100%",
            height: "auto"
        }
    });
