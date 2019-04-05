import { Theme, createStyles } from "@material-ui/core";

export const styles = (theme: Theme) => createStyles({
    dialog: {
        minHeight: 400
    },
    dialogContent: {
        paddingBottom: 0
    },
    dialogActions: {
        paddingLeft: theme.spacing.unit * 1.25
    },
    charsReachingLimit: {
        color: theme.palette.error.main
    },
    warningCaption: {
        height: 16,
        verticalAlign: "text-bottom"
    },
    composeAttachmentArea: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden'
    },
    composeAttachmentAreaGridList: {
        height: 250,
        width: '100%'
    }
});