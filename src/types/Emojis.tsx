/**
 * Basic type for Emojis on Mastodon.
 */
export type MastodonEmoji = {
    shortcode: string;
    static_url: string;
    url: string;
    visible_in_picker: boolean;
};

/**
 * Trimmed type of Emoji from emoji-mart
 */
export type Emoji = {
    name: string;
    imageUrl: string;
};