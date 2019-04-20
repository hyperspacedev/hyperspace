import {Color} from '@material-ui/core';
import { deepPurple, red, lightGreen, yellow, purple, deepOrange, indigo, lightBlue, orange, blue, amber, pink, brown } from '@material-ui/core/colors';

/**
 * Basic theme colors for Hyperspace.
 */
export type HyperspaceTheme = {
    key: string;
    name: string;
    palette: {
        primary: Color;
        secondary: Color;
    }
}

export const defaultTheme: HyperspaceTheme = {
    key: "defaultTheme",
    name: "Hypergod (Default)",
    palette: {
        primary: deepPurple,
        secondary: red
    }
}

export const gardenerTheme: HyperspaceTheme = {
    key: "gardnerTheme",
    name: "Gardener",
    palette: {
        primary: lightGreen,
        secondary: yellow
    }
}

export const teacherTheme: HyperspaceTheme = {
    key: "teacherTheme",
    name: "Teacher",
    palette: {
        primary: purple,
        secondary: deepOrange
    }
}

export const jokerTheme: HyperspaceTheme = {
    key: "jokerTheme",
    name: "Joker",
    palette: {
        primary: indigo,
        secondary: lightBlue
    }
}

export const brotherTheme: HyperspaceTheme = {
    key: "brotherTheme",
    name: "Brother",
    palette: {
        primary: red,
        secondary: orange
    }
}

export const guardTheme: HyperspaceTheme = {
    key: "guardTheme",
    name: "Guard",
    palette: {
        primary: blue,
        secondary: deepOrange
    }
}

export const scientistTheme: HyperspaceTheme = {
    key: "scientistTheme",
    name: "Scientist",
    palette: {
        primary: amber,
        secondary: yellow
    }
}

export const entertainerTheme: HyperspaceTheme = {
    key: "entertainerTheme",
    name: "Entertainer",
    palette: {
        primary: pink,
        secondary: purple
    }
}

export const kingTheme: HyperspaceTheme = {
    key: "kingTheme",
    name: "King",
    palette: {
        primary: deepPurple,
        secondary: amber
    }
}

export const dragonTheme: HyperspaceTheme = {
    key: "dragonTheme",
    name: "Dragon",
    palette: {
        primary: purple,
        secondary: purple
    }
}

export const memoriumTheme: HyperspaceTheme = {
    key: "memoriumTheme",
    name: "Memorium",
    palette: {
        primary: red,
        secondary: red
    }
}

export const blissTheme: HyperspaceTheme = {
    key: "blissTheme",
    name: "Bliss",
    palette: {
        primary: brown,
        secondary: lightBlue
    }
}

export const themes = [defaultTheme, gardenerTheme, teacherTheme, jokerTheme, brotherTheme, guardTheme, scientistTheme, entertainerTheme, kingTheme, dragonTheme, memoriumTheme, blissTheme]