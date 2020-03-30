import { Account } from "./Account";
import { Tag } from "./Tag";
import { MastodonEmoji } from "./Emojis";

export type Announcement = {
    id: string;
    content: string;
    starts_at?: string;
    ends_at?: string;
    all_day: boolean;
    published_at: string;
    updated_at: string;
    read: boolean;
    mentions: [Account];
    tags: [Tag];
    emojis: [MastodonEmoji];
};
