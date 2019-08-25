import Mastodon from "megalodon";

export function userLoggedIn(): boolean {
    if (localStorage.getItem('baseurl') && localStorage.getItem('access_token')) {
        return true;
    } else {
        return false;
    }
}

export function refreshUserAccountData() {
    let client = new Mastodon(localStorage.getItem('access_token') as string, localStorage.getItem('baseurl') as string + "/api/v1");
    client.get('/accounts/verify_credentials').then((resp: any) => {
        localStorage.setItem('account', JSON.stringify(resp.data));
    }).catch((err: Error) => {
        console.error(err.message);
    });
    client.get('/instance').then((resp: any) => {
        localStorage.setItem('isPleroma', (resp.data.version.match(/Pleroma/) ? "true" : "false"))
    })
}