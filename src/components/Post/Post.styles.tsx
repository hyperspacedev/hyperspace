import { Theme, createStyles } from "@material-ui/core";

export const styles = (theme: Theme) => createStyles({
    post: {
      marginTop: theme.spacing.unit,
      marginBottom: theme.spacing.unit
    },
    postReblogChip: {
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: theme.palette.secondary.light
      },
      marginBottom: theme.spacing.unit
    },
    postContent: {
      paddingTop: 0,
      paddingBottom: 0,
      '& a': {
        textDecoration: 'none',
        color: theme.palette.secondary.light,
        '&:hover': {
          textDecoration: 'underline'
        },
      }
    },
    postCard: {
      '& a:hover': {
        textDecoration: 'none'
      }
    },
    postEmoji: {
      width: theme.typography.body2.fontSize
    },
    postMedia: {
      height: 0,
      paddingTop: '56.25%', // 16:9
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
      color: theme.palette.grey[700]
    },
    postDidAction: {
      color: theme.palette.secondary.main
    }
});