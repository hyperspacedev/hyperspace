import { MastodonEmoji } from "../types/Emojis";
import Mastodon from "megalodon";

/**
 * Takes a given string and replaces emoji codes with their respective image tags.
 * @param contents The string to replace with emojis
 * @param emojis The set of emojis to replace the content with
 * @param className The associated class for the string
 * @returns String with image tags for emojis
 */
export function emojifyString(
    contents: string,
    emojis: [MastodonEmoji],
    className?: any
): string {
    let newContents: string = contents;

    emojis.forEach((emoji: MastodonEmoji) => {
        let filter = new RegExp(`:${emoji.shortcode}:`, "g");
        newContents = newContents.replace(
            filter,
            `<img src=${emoji.static_url} ${
                className ? `class="${className}"` : ""
            }/>`
        );
    });

    return newContents;
}

export function collectEmojisFromServer() {
    let client = new Mastodon(
        localStorage.getItem("access_token") as string,
        localStorage.getItem("baseurl") + "/api/v1"
    );
    let emojisPath = localStorage.getItem("emojis");
    let emojis: any[] = [];
    if (emojisPath === null) {
        client
            .get("/custom_emojis")
            .then((resp: any) => {
                resp.data.forEach((emoji: MastodonEmoji) => {
                    let customEmoji = {
                        name: emoji.shortcode,
                        emoticons: [""],
                        short_names: [emoji.shortcode],
                        imageUrl: emoji.static_url,
                        keywords: ["mastodon", "custom"]
                    };
                    emojis.push(customEmoji);
                    localStorage.setItem("emojis", JSON.stringify(emojis));
                });
            })
            .catch((err: Error) => {
                console.error(err.message);
            });
    }
}
