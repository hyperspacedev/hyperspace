import {Color} from '@material-ui/core';
import { deepPurple, red, lightGreen, yellow, purple, deepOrange, indigo, lightBlue, orange, blue, amber, pink } from '@material-ui/core/colors';

/**
 * Basic theme colors for Hyperspace.
 */
export type HyperspaceTheme = {
    name: string;
    palette: {
        primary: Color;
        secondary: Color;
    }
}

export const defaultTheme: HyperspaceTheme = {
    name: "Hypergod (Default)",
    palette: {
        primary: deepPurple,
        secondary: red
    }
}

export const gardenerTheme: HyperspaceTheme = {
    name: "Gardener",
    palette: {
        primary: lightGreen,
        secondary: yellow
    }
}

export const teacherTheme: HyperspaceTheme = {
    name: "Teacher",
    palette: {
        primary: purple,
        secondary: deepOrange
    }
}

export const jokerTheme: HyperspaceTheme = {
    name: "Joker",
    palette: {
        primary: indigo,
        secondary: lightBlue
    }
}

export const brotherTheme: HyperspaceTheme = {
    name: "Brother",
    palette: {
        primary: red,
        secondary: orange
    }
}

export const guardTheme: HyperspaceTheme = {
    name: "Guard",
    palette: {
        primary: blue,
        secondary: deepOrange
    }
}

export const scientistTheme: HyperspaceTheme = {
    name: "Scientist",
    palette: {
        primary: amber,
        secondary: yellow
    }
}

export const entertainerTheme: HyperspaceTheme = {
    name: "Entertainer",
    palette: {
        primary: pink,
        secondary: purple
    }
}

export const kingTheme: HyperspaceTheme = {
    name: "King",
    palette: {
        primary: deepPurple,
        secondary: amber
    }
}