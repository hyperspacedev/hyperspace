/**
 * Basic type for a Poll on Mastodon
 */
export type Poll = {
    id: string;
    expires_at: string | null;
    expired: boolean;
    multiple: boolean;
    votes_count: number;
    options: [PollOption];
    voted: boolean | null;
}

/**
 * Basic type for a Poll option in a Poll
 */
export type PollOption = {
    title: string;
    votes_count: number | null;
}