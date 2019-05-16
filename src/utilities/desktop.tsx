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
    return isDesktopApp() && navigator.userAgent.includes("Macintosh")
}

/**
 * Determine whether the system is in dark mode or not (macOS)
 */
export function isDarkMode() {
    // Lift window to an ElectronWindow and add use require()
    const eWin = window as ElectronWindow;
    const {remote} = eWin.require('electron');
    return remote.systemPreferences.isDarkMode()
}