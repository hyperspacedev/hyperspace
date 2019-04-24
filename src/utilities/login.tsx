import Mastodon from 'megalodon';

/**
 * Creates the Hyperspace app with the appropriate Redirect URI
 * @param scopes The scopes that the app needs
 * @param baseurl The base URL of the instance
 * @param redirect_uri The URL to redirect to when authorizing
 */
export function createHyperspaceApp(scopes: string, baseurl: string, redirect_uri: string) {
    return Mastodon.createApp("Hyperspace", {
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