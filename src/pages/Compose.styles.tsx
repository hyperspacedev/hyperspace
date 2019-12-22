import { Theme, createStyles } from "@material-ui/core";

export const styles = (theme: Theme) =>
    createStyles({
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
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-around",
            overflow: "hidden"
        },
        composeAttachmentAreaGridList: {
            height: 250,
            width: "100%"
        },
        composeEmoji: {
            marginTop: theme.spacing.unit * 8
        },
        desktopOnly: {
            display: "none",
            [theme.breakpoints.up("sm")]: {
                display: "block"
            }
        },
        pollWizardOptionIcon: {
            marginRight: theme.spacing.unit * 2,
            marginTop: 4,
            marginBottom: 4,
            color: theme.palette.grey[700]
        },
        pollWizardFlexGrow: {
            flexGrow: 1
        },
        draftDisplayArea: {
            display: "flex",
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 4,
            paddingBottom: 4,
            borderColor: theme.palette.action.disabledBackground,
            borderWidth: 0.25,
            borderStyle: "solid",
            borderRadius: 2,
            verticalAlign: "middle",
            marginLeft: 16,
            marginRight: 16
        },
        draftText: {
            padding: theme.spacing.unit / 2
        },
        draftFlexGrow: {
            flexGrow: 1
        }
    });
