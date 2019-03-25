import { MastodonEmoji } from './Emojis';
import { Visibility } from './Visibility';
import { Account } from './Account';
import { Attachment } from './Attachment';
import { Mention } from './Mention';
import { Poll } from './Poll';
import { Card } from './Card';

/**
 * Basic type for a status on Mastodon
 */
export type Status = {
    id: string;
    uri: string;
    url: string | null;
    account: Account;
    in_reply_to_id: string | null;
    in_reply_to_account_id: string | null;
    reblog: Status | null;
    content: string;
    created_at: string;
    emojis: [MastodonEmoji];
    replies_count: number;
    reblogs_count: number;
    favourites_count: number;
    reblogged: boolean | null;
    favourited: boolean | null;
    muted: boolean | null;
    sensitive: boolean;
    spoiler_text: string;
    visibility: Visibility;
    media_attachments: [Attachment];
    mentions: [Mention];
    tags: any;
    card: Card | null;
    poll: Poll | null;
    application: any;
    pinned: boolean | null;
}