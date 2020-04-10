import { defaultTheme, themes } from "../types/HyperspaceTheme";
import axios from "axios";
import { Config } from "../types/Config";
import { Visibility } from "../types/Visibility";

type SettingsTemplate = {
    [key: string]: any;
    darkModeEnabled: boolean;
    systemDecidesDarkMode: boolean;
    enablePushNotifications: boolean;
    clearNotificationsOnRead: boolean;
    displayAllOnNotificationBadge: boolean;
    defaultVisibility: string;
    imposeCharacterLimit: boolean;
    canSendNotifications: boolean;
};

/**
 * Gets the user default from localStorage
 * @param key The settings key to retrieve from localStorage
 * @returns The boolean value associated with the key
 */
export function getUserDefaultBool(key: string): boolean {
    if (localStorage.getItem(key) === null) {
        console.warn(
            "This key has not been set before, so the default value is FALSE for now."
        );
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
        console.warn("This key has not been set before.");
    }
    localStorage.setItem(key, value.toString());
}

/**
 * Gets the user default visibility from localStorage
 * @returns The Visibility value associated with the key
 */
export function getUserDefaultVisibility(): Visibility {
    if (localStorage.getItem("defaultVisibility") === null) {
        console.warn(
            "This key has not been set before, so the default value is PUBLIC for now."
        );
        return "public";
    } else {
        return localStorage.getItem("defaultVisibility") as Visibility;
    }
}

/**
 * Set a user default visibility to localStorage
 * @param key The settings key in localStorage to change
 */
export function setUserDefaultVisibility(key: string) {
    if (localStorage.getItem("defaultVisibility") === null) {
        console.warn("This key has not been set before.");
    }
    localStorage.setItem("defaultVisibility", key.toString());
}

/**
 * Gets the user's default theme or the default theme
 */
export function getUserDefaultTheme() {
    let returnTheme = defaultTheme;
    themes.forEach(theme => {
        if (theme.key === localStorage.getItem("theme")) {
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
    localStorage.setItem("theme", themeName);
}

/**
 * Creates the user defaults if they do not exist already.
 */
export function createUserDefaults() {
    let defaults: SettingsTemplate = {
        darkModeEnabled: false,
        systemDecidesDarkMode: true,
        enablePushNotifications: true,
        clearNotificationsOnRead: false,
        displayAllOnNotificationBadge: false,
        defaultVisibility: "public",
        imposeCharacterLimit: true,
        isMasonryLayout: false,
        canSendNotifications: false
    };

    let settings = [
        "darkModeEnabled",
        "systemDecidesDarkMode",
        "clearNotificationsOnRead",
        "displayAllOnNotificationBadge",
        "defaultVisibility",
        "imposeCharacterLimit",
        "isMasonryLayout",
        "canSendNotifications"
    ];

    migrateExistingSettings();

    settings.forEach((setting: string) => {
        if (localStorage.getItem(setting) === null) {
            if (typeof defaults[setting] === "boolean") {
                setUserDefaultBool(setting, defaults[setting]);
            } else {
                localStorage.setItem(setting, defaults[setting].toString());
            }
        }
    });

    setUserDefaultBool("userDeniedNotications", false);
}

/**
 * Gets the configuration data from `config.json`
 * @returns The Promise data from getting the config.
 */
export async function getConfig(): Promise<Config | undefined> {
    try {
        const resp = await axios.get("config.json");

        let { location } = resp.data;

        if (!location.endsWith("/")) {
            console.info(
                "Location does not have a backslash, so Hyperspace has added it automatically."
            );
            resp.data.location = location + "/";
        }

        if (process.env.NODE_ENV === "development") {
            resp.data.location = "http://localhost:3000/";
            console.info("Location field has been updated to localhost:3000.");
        }

        return resp.data as Config;
    } catch (err) {
        console.error(
            "Couldn't configure Hyperspace with the config file. Reason: " +
                err.name
        );
    }
}

export function migrateExistingSettings() {
    if (localStorage.getItem("prefers-dark-mode")) {
        setUserDefaultBool(
            "darkModeEnabled",
            localStorage.getItem("prefers-dark-mode") === "true"
        );
    }
}
