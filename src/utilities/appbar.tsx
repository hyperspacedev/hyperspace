import { isDarwinApp } from "./desktop";

/**
 * Determine whether the title bar is being displayed.
 * This might be useful in cases where styles are dependent on the title bar's visibility, such as heights.
 *
 * @returns Boolean dictating if the title bar is visible
 */
export function isAppbarExpanded(): boolean {
    return isDarwinApp() || process.env.NODE_ENV === "development";
}
