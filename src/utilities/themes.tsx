import { createMuiTheme, Theme } from '@material-ui/core';
import { HyperspaceTheme } from '../types/HyperspaceTheme';

/**
 * Creates a Material-UI theme from a selected Hyperspace theme palette.
 * @param theme The Hyperspace theme that should be applied
 * @returns A Material-UI theme with the Hyperspace theme's palette colors
 */
export function setHyperspaceTheme(theme: HyperspaceTheme): Theme {
    return createMuiTheme({
        typography: {
            fontFamily: [
              '-apple-system',
              'BlinkMacSystemFont',
              '"Segoe UI"',
              'Roboto',
              '"Helvetica Neue"',
              'Arial',
              'sans-serif',
              '"Apple Color Emoji"',
              '"Segoe UI Emoji"',
              '"Segoe UI Symbol"',
            ].join(','),
            useNextVariants: true,
          },
        palette: {
            primary: theme.palette.primary,
            secondary: theme.palette.secondary
        }
    })
}

/**
 * Sets the app's palette type (aka. turns on an off dark mode)
 * @param theme The Material-UI theme to toggle the dark mode on
 * @param setting Whether dark mode should be on (`true`) or off (`false`)
 */
export function darkMode(theme: Theme, setting: boolean): Theme {
    if (setting) {
        theme.palette.type = 'dark';
    } else {
        theme.palette.type = 'light';
    }
    return theme;
}