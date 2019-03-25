import { MastodonEmoji } from './Emojis';
import { Field } from './Field';

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
}