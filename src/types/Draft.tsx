/**
 * Base draft type for a cached draft.
 */
export type Draft = {
    /**
     * The contents of the draft (i.e, its post text).
     */
    contents: string;
    /**
     * The ID of the post it replies to, if applicable. If there isn't one, it should be set to -999.
     */
    replyId: number;
};
