import Mastodon from 'megalodon';

/**
 * Creates the Hyperspace app with the appropriate Redirect URI
 * @param name The name of the app (if not Hyperspace, will use `name (Hyperspace-like)`)
 * @param scopes The scopes that the app needs
 * @param baseurl The base URL of the instance
 * @param redirect_uri The URL to redirect to when authorizing
 */
export function createHyperspaceApp(name: string, scopes: string, baseurl: string, redirect_uri: string) {
    let appName = name === "Hyperspace"? "Hyperspace": `${name} (Hyperspace-like)`
    return Mastodon.createApp(appName, {
        scopes: scopes,
        redirect_uris: redirect_uri,
        website: 'https://hyperspace.marquiskurt.net',
    }, baseurl).then(appData => {
        return Mastodon.generateAuthUrl(appData.clientId, appData.clientSecret, {
            redirect_uri: redirect_uri,
            scope: scopes
        }, baseurl).then(url => {
            appData.url = url;
            return appData;
        })
    })
}