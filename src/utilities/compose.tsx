import { Draft } from "../types/Draft";

/**
 * Check whether a cached draft exists.
 */
export function draftExists(): boolean {
    return sessionStorage.getItem("cachedDraft") !== null;
}

/**
 * Write a draft to session storage.
 * @param draft The text of the post.
 * @param replyId The post's reply ID, if available.
 */
export function writeDraft(draft: string, replyId?: number) {
    let cachedDraft = {
        contents: draft,
        replyId: replyId ? replyId : -999
    };
    sessionStorage.setItem("cachedDraft", JSON.stringify(cachedDraft));
}

/**
 * Return the cached draft and remove it from session storage.
 * @returns A Draft object with the draft's contents and reply ID (or -999).
 */
export function loadDraft(): Draft {
    let contents = "";
    let replyId = -999;
    if (draftExists()) {
        let draft = sessionStorage.getItem("cachedDraft");
        sessionStorage.removeItem("cachedDraft");
        if (draft != null) {
            const draftObject = JSON.parse(draft);
            contents = draftObject.contents;
            replyId = draftObject.replyId;
        }
    }
    return {
        contents: contents,
        replyId: replyId
    };
}
