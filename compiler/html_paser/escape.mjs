import { htmlEscape } from "./tags.mjs"

export const unescapedString = (htmlString) => {
    return htmlString.replace(/&[a-z]+;/g, match => htmlEscape[match] || match);
}