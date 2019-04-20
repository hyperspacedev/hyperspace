/**
 * Types of a post's visibility on Mastodon.
 */
export type Visibility = "direct" | "private" | "unlisted" | "public";

export function toVisibility(what: string) {
    let visibilities: Visibility[] = ["direct", "private", "unlisted", "public"];
    let vis: Visibility = "public";
    visibilities.forEach((visibility: Visibility) => {
        if (what == visibility) {
            vis = visibility;
        }
    });
    return vis;
}