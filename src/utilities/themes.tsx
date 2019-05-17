import { createMuiTheme, Theme } from '@material-ui/core';
import { HyperspaceTheme, themes, defaultTheme } from '../types/HyperspaceTheme';
import { getUserDefaultBool } from './settings';
import { isDarwinApp, isDarkMode } from './desktop';

/**
 * Locates a Hyperspace theme from the themes catalog
 * @param name The name of the theme to return
 * @returns Hyperspace theme with name or the default
 */
export function getHyperspaceTheme(name: string): HyperspaceTheme {
    let theme: HyperspaceTheme = defaultTheme;
    themes.forEach((themeItem: HyperspaceTheme) => {
        if (themeItem.key === name) {
            theme = themeItem;
        }
    });
    return theme;
}

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
            secondary: theme.palette.secondary,
            type: getUserDefaultBool('darkModeEnabled')? "dark": 
                    getDarkModeFromSystem() === "dark"? "dark": "light"
        }
    })
}

export function getDarkModeFromSystem(): string {
    if (getUserDefaultBool('systemDecidesDarkMode')) {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        } else {
            if (isDarwinApp()) {
                return isDarkMode()? "dark": "light";
            } else {
                return "light";
            }
        }
    } else {
        return "light";
    }
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