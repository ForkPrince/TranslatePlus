/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { TranslationValue } from "./types";
import { Native } from "./native";

interface YandexData {
    code: number;
    message?: string;
    lang: string;
    text: string[];
}

const TO_YANDEX: Record<string, string> = { "zh-CN": "zh", "zh-TW": "zh", "iw": "he", "jw": "jv" };
const FROM_YANDEX: Record<string, string> = { "zh": "zh-CN", "he": "iw", "jv": "jw" };

const MARKDOWN: [RegExp, string][] = [
    [/\*\*(.+?)\*\*/gs, "b"],
    [/__(.+?)__/gs, "u"],
    [/\*(.+?)\*/gs, "i"],
    [/\b_(.+?)_\b/gs, "i"],
    [/~~(.+?)~~/gs, "s"],
    [/\|\|(.+?)\|\|/gs, "mark"]
];
const MARKDOWN_TAGS: Record<string, string> = { b: "**", u: "__", i: "*", s: "~~", mark: "||" };
const ENTITIES: Record<string, string> = { "&lt;": "<", "&gt;": ">", "&quot;": "\"", "&#39;": "'", "&amp;": "&" };
const PROTECTED = /```[\s\S]*?```|`[^`\n]+`|&lt;a?:\w+:\d+&gt;|&lt;(?:@!?|@&amp;|#)\d+&gt;|&lt;t:-?\d+(?::\w)?&gt;|&lt;\/[\w -]+:\d+&gt;|https?:\/\/\S+/g;

function escapeHtml(text: string) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function unescapeHtml(text: string) {
    return text.replace(/&(?:lt|gt|quot|#39|amp);/g, match => ENTITIES[match]);
}

function toYandexHtml(text: string) {
    const kept: string[] = [];

    let html = escapeHtml(text).replace(PROTECTED, match => `<var>${kept.push(match) - 1}</var>`);

    for (const [regex, tag] of MARKDOWN)
        html = html.replace(regex, `<${tag}>$1</${tag}>`);

    return { html, kept };
}

function fromYandexHtml(html: string, kept: string[]) {
    return unescapeHtml(html
        .replace(/<var>\s*(\d+)\s*<\/var>/gi, (_, index) => kept[index] ?? "")
        .replace(/<\/?(b|u|i|s|mark)>/gi, (_, tag) => MARKDOWN_TAGS[tag.toLowerCase()])
    );
}

export async function yandexTranslate(text: string, sourceLang: string, targetLang: string): Promise<TranslationValue> {
    const { html, kept } = toYandexHtml(text);
    const { status, data } = await Native.makeYandexTranslateRequest(html, TO_YANDEX[targetLang] ?? targetLang);

    if (status === -1) throw new Error(`Failed to connect to Yandex Translate API: ${data}`);
    if (status !== 200) throw new Error(`Failed to translate "${text}" (${sourceLang} -> ${targetLang})\n${status} ${JSON.stringify(data)}`);

    const translation = data as YandexData;

    if (translation.code === 501) throw new Error(`Yandex Translate can't translate into "${targetLang}". Change the target language in the plugin settings.`);
    if (translation.code !== 200) throw new Error(`Yandex Translate request failed with code ${translation.code}: ${translation.message ?? ""}`);

    const [sourceLanguage] = translation.lang.split("-");

    return {
        sourceLanguage: FROM_YANDEX[sourceLanguage] ?? sourceLanguage,
        text: fromYandexHtml(translation.text.join("\n"), kept)
    };
}
