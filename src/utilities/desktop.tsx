/**
 * A Window interface with extra properties for Electron
 */
interface ElectronWindow extends Window {
    require?: any;
}

/**
 * Determines whether the app is running from a website or an app.
 * @returns Boolean of whether it is in desktop mode or not
 */
export function isDesktopApp(): boolean {
    return navigator.userAgent.includes("Hyperspace" || "Electron");
}

/**
 * Determines whether the app is the macOS application
 */
export function isDarwinApp(): boolean {
    return isDesktopApp() && navigator.userAgent.includes("Macintosh");
}

/**
 * Determine whether the system is in dark mode or not (macOS)
 */
export function isDarkMode() {
    // Lift window to an ElectronWindow and add use require()
    const eWin = window as ElectronWindow;
    const { remote } = eWin.require("electron");
    return remote.nativeTheme.shouldUseDarkColors;
}

/**
 * Get the accent color from macOS.
 *
 * Note that the colors will go from left to right, starting from zero (eg.: -1 = Graphite, 0 = Red, 1 = Orange, etc.).
 * Since AppleAccentColor might return an empty string for the blue color, -2 is used instead.
 *
 * @returns The corresponding integer for the accent color
 */
export function getDarwinAccentColor(): number {
    const eWin = window as ElectronWindow;
    const { remote } = eWin.require("electron");
    const themeInteger = remote.systemPreferences.getUserDefault(
        "AppleAccentColor",
        "string"
    );
    return themeInteger === "" ? -2 : parseInt(themeInteger);
}

/**
 * Get the app component from the desktop app
 */
export function getElectronApp() {
    const eWin = window as ElectronWindow;
    const { remote } = eWin.require("electron");
    return remote.app;
}

/**
 * Get the linkable version of a path for the web and desktop.
 * @param path The path to make a linkable version of
 */
export function linkablePath(path: string): string {
    return isDesktopApp() ? "/app" + path : path;
}
