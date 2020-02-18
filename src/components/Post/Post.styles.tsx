import { Theme, createStyles } from "@material-ui/core";

export const styles = (theme: Theme) =>
    createStyles({
        post: {
            marginTop: theme.spacing.unit,
            marginBottom: theme.spacing.unit
        },
        postReblogChip: {
            color: theme.palette.common.white,
            "&:hover": {
                backgroundColor: theme.palette.secondary.light
            },
            backgroundColor: theme.palette.secondary.main,
            marginBottom: theme.spacing.unit
        },
        postReblogMenu: {
            outline: "none"
        },
        postHeaderContent: {
            overflow: 'hidden',
            whiteSpace: 'nowrap',
        },
        postHeaderTitle: {
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            color: theme.palette.text.secondary,
        },
        postContent: {
            paddingTop: 0,
            paddingBottom: 0,
            "& a": {
                textDecoration: "none",
                color: theme.palette.secondary.light,
                "&:hover": {
                    textDecoration: "underline"
                },
                "&.u-url.mention": {
                    textDecoration: "none",
                    color: "inherit",
                    fontWeight: "bold"
                },
                "&.mention.hashtag": {
                    textDecoration: "none",
                    color: "inherit",
                    fontWeight: "bold"
                }
            }
        },
        postCard: {
            "& a:hover": {
                textDecoration: "none"
            }
        },
        postEmoji: {
            height: theme.typography.fontSize
        },
        postMedia: {
            height: 0,
            paddingTop: "56.25%" // 16:9
        },
        postActionsReply: {
            marginLeft: theme.spacing.unit,
            marginRight: theme.spacing.unit
        },
        postFlexGrow: {
            flexGrow: 1
        },
        postTypeIconDiv: {
            marginRight: theme.spacing.unit * 2
        },
        postTypeIcon: {
            color: theme.palette.grey[500]
        },
        postWarningIcon: {
            marginRight: theme.spacing.unit,
            color: "inherit"
        },
        postDidAction: {
            color: theme.palette.secondary.main
        },
        postMention: {
            marginRight: theme.spacing.unit,
            marginBottom: theme.spacing.unit
        },
        nsfwCard: {
            backgroundColor: theme.palette.error.main
        },
        postTags: {
            paddingTop: theme.spacing.unit,
            paddingBottom: theme.spacing.unit
        },
        postAuthorName: {
            whiteSpace: 'nowrap',
            color: theme.palette.text.primary,
        },
        postAuthorAccount: {
            marginLeft: theme.spacing.unit * 0.5,
        },
        postReblogIcon: {
            marginBottom: theme.spacing.unit * -0.5,
            marginLeft: theme.spacing.unit * 0.5,
            marginRight: theme.spacing.unit * 0.5,
        },
        postAuthorEmoji: {
            height: theme.typography.fontSize,
            verticalAlign: "middle"
        },
        heading: {
            color: "inherit"
        },
        mobileOnly: {
            [theme.breakpoints.up("sm")]: {
                display: "none"
            }
        },
        desktopOnly: {
            display: "none",
            [theme.breakpoints.up("sm")]: {
                display: "block"
            }
        }
    });
