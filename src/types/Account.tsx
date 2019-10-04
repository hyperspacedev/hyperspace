import { MastodonEmoji } from "./Emojis";
import { Field } from "./Field";

/**
 * Basic type for an account on Mastodon
 */
export type Account = {
    id: string;
    username: string;
    acct: string;
    display_name: string;
    locked: boolean;
    created_at: string;
    followers_count: number;
    following_count: number;
    statuses_count: number;
    note: string;
    url: string;
    avatar: string;
    avatar_static: string;
    header: string;
    header_static: string;
    emojis: [MastodonEmoji];
    moved: Account | null;
    fields: [Field];
    bot: boolean | null;
};

/**
 * Watered-down type for Mastodon accounts
 */
export type UAccount = {
    id: string;
    acct: string;
    display_name: string;
    avatar_static: string;
};

/**
 * Account type for use with multi-account support
 */
export type MultiAccount = {
    /**
     * The host name of the account (ex.: mastodon.social)
     */
    host: string;

    /**
     * The username of the account (@test)
     */
    username: string;

    /**
     * The access token generated from the login
     */
    access_token: string;
};
