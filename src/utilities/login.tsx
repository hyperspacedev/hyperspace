import Mastodon from "megalodon";

/**
 * Creates the Hyperspace app with the appropriate Redirect URI
 * @param name The name of the app (if not Hyperspace, will use `name (Hyperspace-like)`)
 * @param scopes The scopes that the app needs
 * @param baseurl The base URL of the instance
 * @param redirect_uri The URL to redirect to when authorizing
 */
export function createHyperspaceApp(
    name: string,
    scopes: string,
    baseurl: string,
    redirect_uri: string
) {
    let appName =
        name === "Hyperspace" ? "Hyperspace" : `${name} (Hyperspace-like)`;
    return Mastodon.createApp(
        appName,
        {
            scopes: scopes,
            redirect_uris: redirect_uri,
            website: "https://hyperspace.marquiskurt.net"
        },
        baseurl
    ).then(appData => {
        return Mastodon.generateAuthUrl(
            appData.clientId,
            appData.clientSecret,
            {
                redirect_uri: redirect_uri,
                scope: scopes
            },
            baseurl
        ).then(url => {
            appData.url = url;
            return appData;
        });
    });
}

/**
 * Gets the appropriate redirect address.
 * @param type The address or configuration to use
 */
export function getRedirectAddress(
    type: "desktop" | "dynamic" | string
): string {
    switch (type) {
        case "desktop":
            return "hyperspace://hyperspace/app/";
        case "dynamic":
            return `https://${window.location.host}`;
        default:
            return type;
    }
}

/**
 * Determine whether a base URL is in the 'disallowed' domains section.
 * @param domain The URL to test
 * @returns Boolean dictating the URL's presence in disallowed domains
 */
export function inDisallowedDomains(domain: string): boolean {
    let disallowed = ["gab.com"];
    return disallowed.includes(domain);
}
