import { Theme, createStyles } from '@material-ui/core';

export const styles = (theme: Theme) => createStyles({
    root: {
        width: '100%',
        height: '100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        top: 0,
        left: 0,
        position: "absolute",
        [theme.breakpoints.up('sm')]: {
            paddingTop: theme.spacing.unit * 4,
            paddingLeft: '25%',
            paddingRight: '25%',
        },
        [theme.breakpoints.up('lg')]: {
            paddingTop: theme.spacing.unit * 12,
            paddingLeft: '35%',
            paddingRight: '35%',
        }
    },
    paper: {
        height: '100%',
        [theme.breakpoints.up('sm')]: {
            height: 'auto',
            paddingLeft: theme.spacing.unit * 8,
            paddingRight: theme.spacing.unit * 8,
            paddingTop: theme.spacing.unit * 6,
        },
        paddingTop: theme.spacing.unit * 12,
        paddingLeft: theme.spacing.unit * 4,
        paddingRight: theme.spacing.unit * 4,
        paddingBottom: theme.spacing.unit * 6,
        textAlign: 'center',
        '& a': {
            color: theme.palette.primary.light
        }
    },
    flexGrow: {
        flexGrow: 1
    },
    middlePadding: {
        height: theme.spacing.unit * 6
    },
    logo: {
        [theme.breakpoints.up('sm')]: {
            height: 64,
            width: "auto"
        },
    }
});