import {MastodonEmoji} from '../types/Emojis';

// if (status.emojis !== undefined && status.emojis.length > 0) {
//     status.emojis.forEach((emoji: MastodonEmoji) => {
//         let regexp = new RegExp(':' + emoji.shortcode + ':', 'g');
//         oldContent.innerHTML = oldContent.innerHTML.replace(regexp, `<img src="${emoji.static_url}" class="${classes.postEmoji}"/>`)
//     })
// }

/**
 * Takes a given string and replaces emoji codes with their respective image tags.
 * @param contents The string to replace with emojis
 * @param emojis The set of emojis to replace the content with
 * @param className The associated class for the string
 * @returns String with image tags for emojis
 */
export function emojifyString(contents: string, emojis: [MastodonEmoji], className?: any): string {
    let newContents: string = contents;

    emojis.forEach((emoji: MastodonEmoji) => {
        let filter = new RegExp(`:${emoji.shortcode}:`, 'g');
        newContents = newContents.replace(filter, `<img src=${emoji.static_url} ${className? `class="${className}"`: ""}/>`)
    })

    return newContents;
}