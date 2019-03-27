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
    pageListConstraints: {
        paddingLeft: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        [theme.breakpoints.up('sm')]: {
            paddingLeft: theme.spacing.unit * 2,
            paddingRight: theme.spacing.unit * 2
        }
    }
  });