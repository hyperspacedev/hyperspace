import { isDarwinApp } from "./desktop";

/**
 * A list containing the types of child views.
 *
 * This list is used to help determine if a back button is necessary, usually because there
 * is no defined way of returning to the parent view without using the menu bar or keyboard
 * shortcut in desktop apps.
 */
export const childViews = ["#/profile", "#/conversation"];

/**
 * Determine whether the title bar is being displayed.
 * This might be useful in cases where styles are dependent on the title bar's visibility, such as heights.
 *
 * @returns Boolean dictating if the title bar is visible
 */
export function isAppbarExpanded(): boolean {
    return isDarwinApp() || process.env.NODE_ENV === "development";
}

/**
 * Determine whether a path is considered a "child view".
 *
 * This is often used to determine whether a back button should be rendered or not.
 * @param path The path of the page, usually its hash
 * @returns Boolean distating if the view is a child view.
 */
export function isChildView(path: string): boolean {
    let protocolMatched = false;
    childViews.forEach((childViewProtocol: string) => {
        if (path.startsWith(childViewProtocol)) {
            protocolMatched = true;
        }
    });
    return protocolMatched;
}
