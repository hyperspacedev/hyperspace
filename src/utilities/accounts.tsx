import Mastodon from "megalodon";
import { MultiAccount, Account } from "../types/Account";

export function userLoggedIn(): boolean {
    return !!(
        localStorage.getItem("baseurl") && localStorage.getItem("access_token")
    );
}

export function refreshUserAccountData() {
    let host = localStorage.getItem("baseurl") as string;
    let token = localStorage.getItem("access_token") as string;

    let client = new Mastodon(token, host + "/api/v1");

    client
        .get("/accounts/verify_credentials")
        .then((resp: any) => {
            let account: Account = resp.data;
            localStorage.setItem("account", JSON.stringify(account));
            sessionStorage.setItem("id", account.id);

            addAccountToRegistry(host, token, account.acct);
        })
        .catch((err: Error) => {
            console.error(err.message);
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
export function getAccountRegistry(): MultiAccount[] {
    let accountRegistry: MultiAccount[] = [];

    let accountRegistryString = localStorage.getItem("accountRegistry");
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
    const stringifiedRegistry = accountRegistry.map(account =>
        JSON.stringify(account)
    );

    if (stringifiedRegistry.indexOf(JSON.stringify(newAccount)) === -1) {
        accountRegistry.push(newAccount);
    }

    localStorage.setItem("accountRegistry", JSON.stringify(accountRegistry));
}

/**
 * Remove an account from the multi-account registry, if possible
 * @param accountIdentifier The index of the account from the registry or the MultiAccount object itself
 */
export function removeAccountFromRegistry(
    accountIdentifier: number | MultiAccount
) {
    let accountRegistry = getAccountRegistry();

    if (typeof accountIdentifier === "number") {
        if (accountRegistry.length > accountIdentifier) {
            if (
                localStorage.getItem("access_token") ===
                accountRegistry[accountIdentifier].access_token
            ) {
                localStorage.removeItem("baseurl");
                localStorage.removeItem("access_token");
            }
            accountRegistry.splice(accountIdentifier);
        } else {
            console.log("Multi account index may be out of range");
        }
    } else {
        const stringifiedRegistry = accountRegistry.map(account =>
            JSON.stringify(account)
        );

        const stringifiedAccountId = JSON.stringify(accountIdentifier);

        if (
            stringifiedRegistry.indexOf(
                JSON.stringify(stringifiedAccountId)
            ) !== -1
        ) {
            if (
                localStorage.getItem("access_token") ===
                accountIdentifier.access_token
            ) {
                localStorage.removeItem("baseurl");
                localStorage.removeItem("access_token");
            }

            accountRegistry.splice(
                stringifiedRegistry.indexOf(stringifiedAccountId)
            );
        }
    }

    localStorage.setItem("accountRegistry", JSON.stringify(accountRegistry));
}
