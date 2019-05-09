import { createMuiTheme, Theme, Color } from '@material-ui/core';
import { darken, lighten } from '@material-ui/core/styles/colorManipulator';
import { HyperspaceTheme, themes, defaultTheme } from '../types/HyperspaceTheme';
import { getUserDefaultBool } from './settings';

type Incomplete = {
    main: string;
}

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
            primary: getColors()?
                        getUserDefaultBool('darkModeEnabled') || getDarkModeFromSystem() === "dark"?
                            { main: giveDarkColor(theme.palette.primary)}:
                            theme.palette.primary: 
                        DarkModeColor,
            secondary: getUserDefaultBool('darkModeEnabled') || getDarkModeFromSystem() === "dark"?
                            getColors()? theme.palette.secondary:
                        { main: giveDarkColor(theme.palette.primary) }: theme.palette.secondary,
            type: getUserDefaultBool('darkModeEnabled')? "dark": 
                    getDarkModeFromSystem() === "dark"? "dark": "light"
        }
    });
}

/**
 * Determines if the browser supports the prefers-color-scheme
 * query and has set prefers-color-scheme to `dark`
 */
export function supportsDarkModeFromSystem() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Sets dark mode or light mode from prefers-color-scheme
 */
export function getDarkModeFromSystem(): string {
    if (getUserDefaultBool('systemDecidesDarkMode')) {
        return supportsDarkModeFromSystem()? "dark": "light"
    } else {
        return "light";
    }
}

/**
 * Determine whether to use colors on dark mode or not
 */
export function getColors() {
    if ((getUserDefaultBool("darkModeEnabled") || getDarkModeFromSystem() === "dark") && !(getUserDefaultBool("useColorsOnDarkMode"))) {
        return false;
    } else {
        return true;
    }
}

export function giveDarkColor(color: Color | Incomplete) {
    if ((color as Incomplete).main !== undefined) {
        return lighten((color as Incomplete).main, 2*0.2);
    } else {
        return (color as Color)[200];
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

const DarkModeColor = {
    main: "#121212",
}