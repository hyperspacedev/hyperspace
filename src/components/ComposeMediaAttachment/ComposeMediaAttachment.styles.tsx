import { Theme, createStyles } from "@material-ui/core";

export const styles = (theme: Theme) =>
    createStyles({
        attachmentArea: {
            height: 175,
            width: 268,
            backgroundColor: theme.palette.primary.light,
            color: theme.palette.common.white
        },
        attachmentBar: {
            marginLeft: 0
        },
        attachmentText: {
            backgroundColor: theme.palette.background.paper,
            opacity: 0.5
        }
    });
