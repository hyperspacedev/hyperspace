import Mastodon from "megalodon";

export function refreshUserAccountData() {
    let client = new Mastodon(localStorage.getItem('access_token') as string, localStorage.getItem('baseurl') as string + "/api/v1/");
    client.get('/accounts/verify_credentials').then((resp: any) => {
        if (JSON.stringify(resp.data) !== localStorage.getItem('account'))
            localStorage.setItem('account', JSON.stringify(resp.data));
    });
}