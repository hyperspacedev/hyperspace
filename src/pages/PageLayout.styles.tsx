import { Theme, createStyles } from "@material-ui/core";

export const styles = (theme: Theme) => createStyles({
    root: {
      width: '100%',
      display: 'flex',
      height: '100%'
    },
    pageLayoutConstraints: {
      marginTop: 72,
      flexGrow: 1,
      padding: theme.spacing.unit * 3,
      paddingLeft: theme.spacing.unit,
      paddingRight: theme.spacing.unit,
      [theme.breakpoints.up('md')]: {
        marginLeft: 250,
        marginTop: 88,
        paddingLeft: theme.spacing.unit * 24,
        paddingRight: theme.spacing.unit * 24
      },
    },
    pageLayoutMaxConstraints: {
      marginTop: 72,
      flexGrow: 1,
      paddingTop: theme.spacing.unit * 2,
      padding: theme.spacing.unit,
      [theme.breakpoints.up('md')]: {
        marginLeft: 250,
        marginTop: 88,
        padding: theme.spacing.unit * 3,
        paddingLeft: theme.spacing.unit * 16,
        paddingRight: theme.spacing.unit * 16,
      },
      [theme.breakpoints.up('lg')]: {
        marginLeft: 250,
        marginTop: 88,
        padding: theme.spacing.unit * 3,
        paddingLeft: theme.spacing.unit * 32,
        paddingRight: theme.spacing.unit * 32,
      },
      [theme.breakpoints.up('xl')]: {
        marginLeft: 250,
        marginTop: 88,
        padding: theme.spacing.unit * 3,
        paddingLeft: theme.spacing.unit * 40,
        paddingRight: theme.spacing.unit * 40,
      },
    },
    pageLayoutMinimalConstraints: {
      flexGrow: 1,
      [theme.breakpoints.up('md')]: {
        marginLeft: 250,
      },
    },
    pageLayoutEmptyTextConstraints: {
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2
    },
    pageHeroBackground: {
      position: 'relative',
      height: 'intrinsic',
      backgroundColor: theme.palette.primary.dark,
      width: '100%',
      color: theme.palette.common.white,
      zIndex: 1
    },
    pageHeroBackgroundImage: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      height: '100%',
      width: '100%',
      opacity: 0.40,
      zIndex: -1
    },
    pageHeroContent: {
      padding: 16,
      paddingTop: 116,
      textAlign: 'center',
      width: '100%',
      height: '100%',
      [theme.breakpoints.up('md')]: {
        paddingLeft: '25%',
        paddingRight: '25%',
      },
      position: "relative",
      zIndex: 1
    },
    pageHeroToolbar: {
      position: "absolute",
      right: theme.spacing.unit * 2,
      marginTop: -16,
    },
    pageListConstraints: {
        paddingLeft: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        [theme.breakpoints.up('sm')]: {
            paddingLeft: theme.spacing.unit * 2,
            paddingRight: theme.spacing.unit * 2
        }
    },
    pageProfileAvatar: {
      width: 128,
      height: 128,
      marginLeft: 'auto',
      marginRight: 'auto',
      marginBottom: theme.spacing.unit,
      backgroundColor: theme.palette.primary.main
    },
    pageProfileNameEmoji: {
      height: theme.typography.h4.fontSize,
    },
    pageProfileStatsDiv: {
      display: 'inline-flex',
      marginTop: theme.spacing.unit * 2,
      marginBottom: theme.spacing.unit * 2,
    },
    pageProfileStat: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit
    },
    pageProfileFollowButton: {
      marginTop: theme.spacing.unit,
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      zIndex: 3
    },
    pageContentLayoutConstraints: {
      paddingLeft: theme.spacing.unit,
      paddingRight: theme.spacing.unit,
      paddingTop: theme.spacing.unit * 4,
      paddingBottom: theme.spacing.unit * 2,
      [theme.breakpoints.up('md')]: {
        paddingLeft: theme.spacing.unit * 32,
        paddingRight: theme.spacing.unit * 32
      },
    },
    errorCard: {
      padding: theme.spacing.unit * 4,
      backgroundColor: theme.palette.error.main,
    },
    pageTopChipContainer: {
      zIndex: 24,
      position: "fixed",
      width: '100%'
    },
    pageTopChips: {
      textAlign: 'center',
      [theme.breakpoints.up('md')]: {
        marginRight: '55%'
      },
      [theme.breakpoints.up('xl')]: {
        marginRight: '50%'
      }
    },
    pageTopChip: {
      boxShadow: theme.shadows[10]
    },
    clearAllButton: {
      zIndex: 3,
      position: 'absolute',
      right: 24,
      top: 100,
      [theme.breakpoints.up('md')]: {
        top: 116,
        right: theme.spacing.unit * 24,
      }
    },
    mobileOnly: {
      [theme.breakpoints.up('sm')]: {
        display: 'none'
      }
    },
    desktopOnly: {
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'block'
      }
    },
    pageLayoutFooter: {
      '& a': {
        color: theme.palette.primary.light
      }
    },
    youHeadingAvatar: {
      height: 88,
      width: 88
    },
    youPaper: {
      padding: theme.spacing.unit * 2,
    },
    youGrid: {
      textAlign: "center",
      '& *': {
        marginLeft: "auto",
        marginRight: "auto",
      }
    },
    youGridAvatar: {
      height: 128,
      width: 128
    },
    youGridImage: {
      width: 'auto',
      height: 128
    },
  });