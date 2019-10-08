import { Color } from "@material-ui/core";
import {
    deepPurple,
    red,
    lightGreen,
    yellow,
    purple,
    deepOrange,
    indigo,
    lightBlue,
    blue,
    pink
} from "@material-ui/core/colors";
import {
    isDarkMode,
    isDarwinApp,
    getDarwinAccentColor
} from "../utilities/desktop";

/**
 * Basic theme colors for Hyperspace.
 */
export type HyperspaceTheme = {
    key: string;
    name: string;
    palette: {
        primary:
            | {
                  main: string;
              }
            | Color;
        secondary:
            | {
                  main: string;
              }
            | Color;
    };
};

export const defaultTheme: HyperspaceTheme = {
    key: "defaultTheme",
    name: "Royal (Default)",
    palette: {
        primary: deepPurple,
        secondary: red
    }
};

export const gardenerTheme: HyperspaceTheme = {
    key: "gardnerTheme",
    name: "Botanical",
    palette: {
        primary: lightGreen,
        secondary: yellow
    }
};

export const teacherTheme: HyperspaceTheme = {
    key: "teacherTheme",
    name: "Compassionate",
    palette: {
        primary: purple,
        secondary: deepOrange
    }
};

export const jokerTheme: HyperspaceTheme = {
    key: "jokerTheme",
    name: "Joker",
    palette: {
        primary: indigo,
        secondary: lightBlue
    }
};

export const guardTheme: HyperspaceTheme = {
    key: "guardTheme",
    name: "Enthusiastic",
    palette: {
        primary: blue,
        secondary: deepOrange
    }
};

export const entertainerTheme: HyperspaceTheme = {
    key: "entertainerTheme",
    name: "Animated",
    palette: {
        primary: pink,
        secondary: purple
    }
};

export const classicTheme: HyperspaceTheme = {
    key: "classicTheme",
    name: "Classic",
    palette: {
        primary: {
            main: "#555555"
        },
        secondary: {
            main: "#5c2d91"
        }
    }
};

export const dragonTheme: HyperspaceTheme = {
    key: "dragonTheme",
    name: "Adventurous",
    palette: {
        primary: purple,
        secondary: purple
    }
};

export const memoriumTheme: HyperspaceTheme = {
    key: "memoriumTheme",
    name: "Memorial",
    palette: {
        primary: red,
        secondary: red
    }
};

export const themes = [
    defaultTheme,
    gardenerTheme,
    teacherTheme,
    jokerTheme,
    guardTheme,
    entertainerTheme,
    classicTheme,
    dragonTheme,
    memoriumTheme
];

/**
 * Get the accent color from System Preferences.
 */
function getAquaAccentColor() {
    switch (getDarwinAccentColor()) {
        case 0:
            return isDarkMode() ? "#ff453a" : "#FF3B30";
        case 1:
            return isDarkMode() ? "#ff9f0a" : "#ff9500";
        case 2:
            return isDarkMode() ? "#ffd60a" : "#ffcc00";
        case 3:
            return isDarkMode() ? "#32d74b" : "#28cd41";
        case 5:
            return isDarkMode() ? "#bf5af2" : "#af52de";
        case 6:
            return isDarkMode() ? "#ff375f" : "#ff2d55";
        case -1:
            return isDarkMode() ? "#98989d" : "#8e8e93";
        default:
            return isDarkMode() ? "#0A84FF" : "#007AFF";
    }
}

/**
 * Inject macOS themes and watch for changes.
 */
if (isDarwinApp()) {
    const aquaTheme: HyperspaceTheme = {
        key: "aquaTheme",
        name: "Aqua (Dynamic)",
        palette: {
            primary: {
                main: isDarkMode() ? "#353538" : "#D6D6D6"
            },
            secondary: {
                main: getAquaAccentColor()
            }
        }
    };

    themes.unshift(aquaTheme);
}
