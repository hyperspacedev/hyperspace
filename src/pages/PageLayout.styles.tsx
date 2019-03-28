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
      [theme.breakpoints.up('md')]: {
        marginLeft: 250,
        marginTop: 88,
        paddingLeft: theme.spacing.unit * 24,
        paddingRight: theme.spacing.unit * 24
      },
    },
    pageLayoutMinimalConstraints: {
      flexGrow: 1,
      [theme.breakpoints.up('md')]: {
        marginLeft: 250,
      },
    },
    pageHeroBackground: {
      position: 'relative',
      height: '100%',
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
      zIndex: 1
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
      paddingLeft: theme.spacing.unit * 4,
      paddingRight: theme.spacing.unit * 4,
      paddingTop: theme.spacing.unit * 4,
      [theme.breakpoints.up('md')]: {
        paddingLeft: theme.spacing.unit * 24,
        paddingRight: theme.spacing.unit * 24
      },
    }
  });