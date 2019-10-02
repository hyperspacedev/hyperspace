import Mastodon from "megalodon";
import { MultiAccount } from "../types/Account";

export function userLoggedIn(): boolean {
    return !!(
        localStorage.getItem("baseurl") && localStorage.getItem("access_token")
    );
}

export function refreshUserAccountData() {
    let client = new Mastodon(
        localStorage.getItem("access_token") as string,
        (localStorage.getItem("baseurl") as string) + "/api/v1"
    );
    client
        .get("/accounts/verify_credentials")
        .then((resp: any) => {
            localStorage.setItem("account", JSON.stringify(resp.data));
        })
        .catch((err: Error) => {
            console.error(err.message);
        });
    client.get("/instance").then((resp: any) => {
        localStorage.setItem(
            "isPleroma",
            resp.data.version.match(/Pleroma/) ? "true" : "false"
        );
    });
}

/**
 * Set the access token and base URL to a given multi-account user.
 * @param account The multi-account from localStorage to use
 */
export function loginWithAccount(account: MultiAccount) {
    if (localStorage.getItem("access_token") !== null) {
        console.info(
            "Existing login detected. Removing and using assigned token..."
        );
    }
    localStorage.setItem("access_token", account.access_token);
    localStorage.setItem("baseurl", account.host);
}

/**
 * Gets the account registry.
 * @returns A list of accounts
 */
function getAccountRegistry(): MultiAccount[] {
    let accountRegistry: MultiAccount[] = [];

    let accountRegistryString = localStorage.getItem("registry");
    if (accountRegistryString !== null) {
        accountRegistry = JSON.parse(accountRegistryString);
    }
    return accountRegistry;
}

/**
 * Add an account to the multi-account registry if it doesn't exist already.
 * @param base_url The base URL of the user (eg., the instance)
 * @param access_token The access token for the user
 * @param username The username of the user
 */
export function addAccountToRegistry(
    base_url: string,
    access_token: string,
    username: string
) {
    const newAccount: MultiAccount = {
        host: base_url,
        username,
        access_token
    };

    let accountRegistry = getAccountRegistry();

    if (!accountRegistry.includes(newAccount)) {
        accountRegistry.push(newAccount);
    }

    localStorage.setItem("registry", JSON.stringify(accountRegistry));
}

export function removeAccountFromRegistry(index: number) {
    let accountRegistry = getAccountRegistry();
    if (accountRegistry.length > index) {
        accountRegistry.splice(index);
    } else {
        console.warn("Index of multi-account registry may be out of range.");
    }
    localStorage.setItem("registry", JSON.stringify(accountRegistry));
}
