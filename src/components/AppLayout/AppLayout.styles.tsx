import { Theme, createStyles } from "@material-ui/core";

import { fade } from "@material-ui/core/styles/colorManipulator";

export const styles = (theme: Theme) => createStyles({
    root: {
      width: '100%',
      display: 'flex',
    },
    stickyArea: {
      position: 'fixed',
      width: '100%',
      top: 0,
      left: 0,
      zIndex: 1000,
    },
    titleBarRoot: {
      top: 0,
      left: 0,
      height: 24,
      width: '100%',
      backgroundColor: theme.palette.primary.dark,
      textAlign: 'center',
      zIndex: 1000,
      verticalAlign: 'middle',
      WebkitUserSelect: 'none',
      WebkitAppRegion: "drag"
    },
    titleBarText: {
      color: theme.palette.common.white,
      fontSize: 12,
      paddingTop: 2,
      paddingBottom: 1
    },
    appBar: {
      zIndex: 1000,
    },
    appBarMenuButton: {
      marginLeft: -12,
      marginRight: 20,
      [theme.breakpoints.up('md')]: {
        display: 'none'
      }
    },
    appBarTitle: {
      display: 'none',
      [theme.breakpoints.up('md')]: {
        display: 'block',
      }
    },
    appBarSearch: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25)
      },
      width: '100%',
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      [theme.breakpoints.up('md')]: {
        marginLeft: theme.spacing.unit * 6,
        width: '50%'
      }
    },
    appBarSearchIcon: {
      width: theme.spacing.unit * 9,
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    appBarSearchInputRoot: {
      color: 'inherit',
      width: '100%'
    },
    appBarSearchInputInput: {
      paddingTop: theme.spacing.unit,
      paddingBottom: theme.spacing.unit,
      paddingLeft: theme.spacing.unit * 10,
      paddingRight: theme.spacing.unit,
      transition: theme.transitions.create('width'),
      width: '100%',
    },
    appBarFlexGrow: {
      flexGrow: 1
    },
    appBarActionButtons: {
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
      },
    },
    appBarAcctMenuIcon: {
      backgroundColor: theme.palette.primary.dark
    },
    acctMenu: {
      
    },
    drawer: {
      [theme.breakpoints.up('sm')]: {
        width: 250,
        flexShrink: 0
      },
      zIndex: 1,
    },
    drawerPaper: {
      width: 250,
      zIndex: 1
    },
    drawerPaperWithAppBar: {
      width: 250,
      zIndex: 0,
      marginTop: 64
    },
    drawerPaperWithTitleAndAppBar: {
      width: 250,
      zIndex: 0,
      marginTop: 88
    },
    drawerDisplayMobile: {
      [theme.breakpoints.up('md')]: {
        display: 'none'
      }
    },
    toolbar: theme.mixins.toolbar,
    sectionDesktop: {
      display: 'none',
      [theme.breakpoints.up('md')]: {
        display: 'flex',
      },
    },
    sectionMobile: {
      display: 'flex',
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
    },
    content: {
      padding: theme.spacing.unit * 3,
      [theme.breakpoints.up('md')]: {
        marginLeft: 250
      },
      overflowY: 'auto',
    },
    composeButton: {
      position: "fixed",
      bottom: theme.spacing.unit * 2,
      right: theme.spacing.unit * 2,
      zIndex: 50
    },
  });