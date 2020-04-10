import { Theme, createStyles } from "@material-ui/core";

export const styles = (theme: Theme) =>
    createStyles({
        root: {
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.palette.action.disabledBackground,
            borderWidth: 1,
            borderStyle: "solid"
        },
        progressBar: {
            width: "100%"
        },
        download: {
            color: `${theme.palette.action.active} !important`
        }
    });
