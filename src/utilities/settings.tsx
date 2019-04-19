import { defaultTheme, themes } from "../types/HyperspaceTheme";
import { getNotificationRequestPermission } from './notifications';
import axios from 'axios';
import { Config } from "../types/Config";

type SettingsTemplate = {
    [key:string]: any;
    darkModeEnabled: boolean;
    enablePushNotifications: boolean;
    clearNotificationsOnRead: boolean;
    displayAllOnNotificationBadge: boolean;
}

/**
 * Gets the user default from localStorage
 * @param key The settings key to retrieve from localStorage
 * @returns The boolean value associated with the key
 */
export function getUserDefaultBool(key: string): boolean {
    if (localStorage.getItem(key) === null) {
        console.warn('This key has not been set before, so the default value is FALSE for now.');
        return false;
    } else {
        return localStorage.getItem(key) === "true";
    }
}

/**
 * Set a user default to localStorage
 * @param key The settings key in localStorage to change
 * @param value The boolean value for the key
 */
export function setUserDefaultBool(key: string, value: boolean) {
    if (localStorage.getItem(key) === null) {
        console.warn('This key has not been set before.');
    }
    localStorage.setItem(key, value.toString());
}

/**
 * Gets the user's default theme or the default theme
 */
export function getUserDefaultTheme() {
    let returnTheme = defaultTheme;
    themes.forEach((theme) => {
        if(theme.key === localStorage.getItem('theme')) {
            returnTheme = theme;
        }
    });
    return returnTheme;
}

/**
 * Sets the user's default theme
 * @param themeName The name of the theme
 */
export function setUserDefaultTheme(themeName: string) {
    localStorage.setItem('theme', themeName);
}

/**
 * Creates the user defaults if they do not exist already.
 */
export function createUserDefaults() {
    let defaults: SettingsTemplate = {
        darkModeEnabled: false,
        enablePushNotifications: true,
        clearNotificationsOnRead: false,
        displayAllOnNotificationBadge: false
    }

    let settings = ["darkModeEnabled"];
    settings.forEach((setting: string) => {
        if (localStorage.getItem(setting) === null) {
            setUserDefaultBool(setting, defaults[setting]);
        }
    })
    getNotificationRequestPermission();
}

/**
 * Gets the configuration data from `config.json`
 * @returns The Promise data from getting the config.
 */
export async function getConfig() {
    try {
        const resp = await axios.get('config.json');
        let config: Config = resp.data;
        return config;
    }
    catch (err) {
        console.error("Couldn't configure Hyperspace with the config file. Reason: " + err.name);
    }
}