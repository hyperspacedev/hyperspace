import Mastodon from 'megalodon';
import { Account, UAccount } from '../types/Account';

export function getCurrentUserData() {
    let currentData: Account = JSON.parse(localStorage.getItem('account') as string);
    if (currentData === null) {
        let client = new Mastodon(localStorage.getItem('access_token') as string, localStorage.getItem('baseurl') as string + "/api/v1/");
        client.get('/account/verify_credentials').then((resp: any) => { let acct: Account = resp.data; currentData = acct; return acct; });
    }
    let account: UAccount = {
        acct: "@" + currentData.acct,
        display_name: currentData.display_name || "@" + currentData.acct,
        avatar_static: currentData.avatar_static
    }
    return account;
}