/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

const PUNCTUATION = new Set([`"`, "«", "»", ",", "!", "?", ".", "(", ")", "/", ";", ":"]);
const SHAVIAN_RANGE = /[\u{10450}-\u{1047F}]+/u;

export function isShavian(text: string) {
    return SHAVIAN_RANGE.test(text);
}

export async function toEnglish(message: string) {
    const dictionary = await (await fetch("https://forkprince.github.io/TranslatePlus/shavian.json")).json();

    return message
        .split(/\s+/)
        .map(word => {
            let before = "", after = "";

            if (PUNCTUATION.has(word[0])) {
                before = word[0];
                word = word.slice(1);
            }

            if (PUNCTUATION.has(word[word.length - 1])) {
                after = word[word.length - 1];
                word = word.slice(0, -1);
            }

            return `${before}${dictionary[word] ?? word}${after}`;
        })
        .join(" ");
}