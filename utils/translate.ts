/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { classNameFactory } from "@utils/css";
import { onlyOnce } from "@utils/onlyOnce";
import { PluginNative } from "@utils/types";
import { showToast } from "@webpack/common";

import { DeeplLanguages, deeplLanguageToGoogleLanguage, GoogleLanguages, KagiLanguages } from "../misc/languages";
import { resetLanguageDefaults, settings } from "../settings";

export const cl = classNameFactory("ec-trans-");

const Native = VencordNative.pluginHelpers["Translate+"] as PluginNative<typeof import("../native")>;

interface GoogleData {
    translation: string;
    sourceLanguage: string;
}

interface DeeplData {
    translations: {
        detected_source_language: string;
        text: string;
    }[];
}

interface KagiData {
    translation: string;
    detected_language: {
        label: string;
    };
}

interface YandexData {
    code: number;
    message?: string;
    lang: string;
    text: string[];
}

export interface TranslationValue {
    sourceLanguage: string;
    text: string;
}

export const getLanguages = () => {
    if (IS_WEB) {
        return GoogleLanguages;
    }
    switch (settings.store.service) {
        case "google":
        case "yandex":
            return GoogleLanguages;
        case "kagi":
            return KagiLanguages;
        default:
            return DeeplLanguages;
    }
};

function isTokiPona(text: string) {
    return (text.match(/\b(?:leko|weka|pan|lete|linja|lipu|suli|nimi|akesi|misikeke|selo|ike|sijelo|sona|lili|pimeja|ante|jo|loje|telo|walo|kijetesantakalu|kasi|waso|wile|utala|lukin|sina|lape|ma|pilin|jasima|la|olin|pipi|meso|lawa|pi|pakala|oko|tan|ken|jaki|unpa|esun|seme|sitelen|len|kule|soko|open|ala|tenpo|lon|sinpin|pini|kokosila|mama|musi|monsi|mewika|taso|ona|mun|kiwen|tomo|mute|mi|nena|palisa|meli|laso|wawa|ale|kipisi|kulupu|ilo|lupa|nanpa|en|mu|jelo|kili|tonsi|moku|ni|kama|pu|poki|monsuta|sin|lasina|poka|soweli|sewi|elena|epiku|moli|pona|lanpan|alasa|anu|kute|uta|luka|suno|sama|awen|namako|suwi|noka|seli|mije|sike|jan|pali|tawa|inli|nasa|mani|wan|insa|nijon|nasin|kalama|ijo|toki|anpa|kala|kepeken|ko|kon|pana|tu|supa|kin|usawi|yupekosi)\b/gm) || []).length >= text.split(/\s+/).length * 0.5;
}

function isSitelen(text: string) {
    return /(?:󱤀|󱤁|󱤂|󱤃|󱤄|󱤅|󱤆|󱤇|󱤈|󱤉|󱤊|󱤋|󱤌|󱤍|󱤎|󱤏|󱤐|󱤑|󱤒|󱤓|󱤔|󱤕|󱤖|󱤗|󱤘|󱤙|󱤚|󱤛|󱤜|󱤝|󱤞|󱤟|󱤠|󱤡|󱤢|󱤣|󱤤|󱤥|󱤦|󱤧|󱤨|󱤩|󱤪|󱤫|󱤬|󱤭|󱤮|󱤯|󱤰|󱤱|󱤲|󱤳|󱤴|󱤵|󱤶|󱤷|󱤸|󱤹|󱤺|󱤻|󱤼|󱤽|󱤾|󱤿|󱥀|󱥁|󱥂|󱥃|󱥄|󱥅|󱥆|󱥇|󱥈|󱥉|󱥊|󱥋|󱥌|󱥍|󱥎|󱥏|󱥐|󱥑|󱥒|󱥓|󱥔|󱥕|󱥖|󱥗|󱥘|󱥙|󱥚|󱥛|󱥜|󱥝|󱥞|󱥟|󱥠|󱥡|󱥢|󱥣|󱥤|󱥥|󱥦|󱥧|󱥨|󱥩|󱥪|󱥫|󱥬|󱥭|󱥮|󱥯|󱥰|󱥱|󱥲|󱥳|󱥴|󱥵|󱥶|󱥷|󱦠|󱦡|󱦢|󱦣|󱥸|󱥹|󱥺|󱥻|󱥼|󱥽|󱥾|󱥿|󱦀|󱦁|󱦂|󱦃|󱦄|󱦅|󱦆|󱦇|󱦈|󱦐|󱦑|󱦒|󱦓|󱦔|󱦕|󱦖|󱦗|󱦘|󱦙|󱦚|󱦛|󱦜|󱦝)/gm.test(text);
}

function isShavian(text: string) {
    return /[\u{10450}-\u{1047F}]+/u.test(text);
}

async function translateShavian(message: string) {
    const dictionary = await (await fetch("https://forkprince.github.io/TranslatePlus/shavian.json")).json();

    const punctuation = new Set([`"`, "«", "»", ",", "!", "?", ".", "(", ")", "/", ";", ":"]);

    return message
        .split(/\s+/)
        .map((word) => {
            let before = "", after = "";

            if (punctuation.has(word[0])) {
                before = word[0];
                word = word.slice(1);
            }

            if (punctuation.has(word[word.length - 1])) {
                after = word[word.length - 1];
                word = word.slice(0, -1);
            }

            return `${before}${dictionary[word] ?? word}${after}`;
        })
        .join(" ");
}

async function toSitelen(message: string) {
    const dictionary = await (await fetch("https://forkprince.github.io/TranslatePlus/sitelen-pona.json")).json();

    const pattern = new RegExp(`(${Object.keys(dictionary).sort((a, b) => b.length - a.length).join("|")})`, "g");

    return Array.from(message)
        .join(" ")
        .replace(pattern, m => dictionary[m]);
}

const toYandex: Record<string, string> = { "zh-CN": "zh", "zh-TW": "zh", "iw": "he", "jw": "jv" };
const fromYandex: Record<string, string> = { "zh": "zh-CN", "he": "iw", "jv": "jw" };
const markdown: [RegExp, string][] = [
    [/\*\*(.+?)\*\*/gs, "b"],
    [/__(.+?)__/gs, "u"],
    [/\*(.+?)\*/gs, "i"],
    [/\b_(.+?)_\b/gs, "i"],
    [/~~(.+?)~~/gs, "s"],
    [/\|\|(.+?)\|\|/gs, "mark"]
];
const marks: Record<string, string> = { b: "**", u: "__", i: "*", s: "~~", mark: "||" };

function toYandexHtml(text: string) {
    const kept: string[] = [];
    let html = text
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/```[\s\S]*?```|`[^`\n]+`|&lt;a?:\w+:\d+&gt;|&lt;(?:@!?|@&amp;|#)\d+&gt;|&lt;t:-?\d+(?::\w)?&gt;|&lt;\/[\w -]+:\d+&gt;|https?:\/\/\S+/g, m => `<var>${kept.push(m) - 1}</var>`);
    for (const [regex, tag] of markdown) html = html.replace(regex, `<${tag}>$1</${tag}>`);
    return { html, kept };
}

function fromYandexHtml(html: string, kept: string[]) {
    return html
        .replace(/<var>\s*(\d+)\s*<\/var>/gi, (_, i) => kept[i] ?? "")
        .replace(/<\/?(b|u|i|s|mark)>/gi, (_, tag) => marks[tag.toLowerCase()])
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

async function yandexTranslate(text: string, sourceLang: string, targetLang: string): Promise<TranslationValue> {
    if (!text) return { sourceLanguage: "", text: "" };

    const { html, kept } = toYandexHtml(text);
    // Yandex auto-detects the source language, so only the target is sent.
    const { status, data } = await Native.makeYandexTranslateRequest(html, toYandex[targetLang] ?? targetLang);

    if (status === -1)
        throw "Failed to connect to Yandex Translate API: " + data;

    if (status !== 200)
        throw new Error(
            `Failed to translate "${text}" (${sourceLang} -> ${targetLang})`
            + `\n${status} ${JSON.stringify(data)}`
        );

    const translation: YandexData = data;

    if (translation.code === 501)
        throw `Yandex Translate can't translate into "${targetLang}". Change the target language in the plugin settings.`;

    if (translation.code !== 200)
        throw new Error(`Yandex Translate request failed with code ${translation.code}: ${translation.message ?? ""}`);

    const sourceLanguage = translation.lang.split("-")[0];

    return {
        sourceLanguage: fromYandex[sourceLanguage] ?? sourceLanguage,
        text: fromYandexHtml(translation.text.join("\n"), kept)
    };
}

export async function translate(kind: "received" | "sent", text: string): Promise<TranslationValue> {
    const { toki, sitelen, shavian } = settings.store;

    const translate = IS_WEB ? googleTranslate : (() => {
        switch (settings.store.service) {
            case "google":
                return googleTranslate;
            case "yandex":
                return yandexTranslate;
            case "kagi":
                return kagiTranslate;
            default:
                return deeplTranslate;
        }
    })();

    const target = settings.store[`${kind}Output`];

    const out = async (sourceLanguage: string, text: string) => {
        if (target === "en") return { sourceLanguage, text };

        const { text: translated } = await translate(text, "en", target);
        return { sourceLanguage, text: translated };
    };

    try {
        if ((toki || sitelen) && (isTokiPona(text) || isSitelen(text))) {
            const processed = sitelen && isSitelen(text) ? await toSitelen(text) : text;

            const translated = (await (await fetch("https://toki.twint.pp.ua/v1", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text: processed,
                    src: "tl",
                    target: "en"
                })
            })).json()).translation[0];

            return out("Toki Pona", translated);
        }

        if (isShavian(text) && shavian) {
            return out("Shavian", await translateShavian(text));
        }
    } catch (e) {
        console.error("Custom language translation failed, using fallback:", e);
    }

    try {
        return await translate(
            text,
            settings.store[`${kind}Input`],
            target
        );
    } catch (e) {
        const userMessage = typeof e === "string"
            ? e
            : "Something went wrong. If this issue persists, please check the console or ask for help in the support server.";

        showToast({ text: userMessage, variant: "critical" });

        throw e instanceof Error
            ? e
            : new Error(userMessage);
    }
}

async function googleTranslate(text: string, sourceLang: string, targetLang: string): Promise<TranslationValue> {
    const url = "https://translate-pa.googleapis.com/v1/translate?" + new URLSearchParams({
        "params.client": "gtx",
        "dataTypes": "TRANSLATION",
        "key": "AIzaSyDLEeFI5OtFBwYBIoK_jj5m32rZK5CkCXA", // some google API key
        "query.sourceLanguage": sourceLang,
        "query.targetLanguage": targetLang,
        "query.text": text,
    });

    const res = await fetch(url);
    if (!res.ok)
        throw new Error(
            `Failed to translate "${text}" (${sourceLang} -> ${targetLang})`
            + `\n${res.status} ${res.statusText}`
        );

    const { sourceLanguage, translation }: GoogleData = await res.json();

    return {
        sourceLanguage: GoogleLanguages[sourceLanguage] ?? sourceLanguage,
        text: translation
    };
}

function fallbackToGoogle(text: string, sourceLang: string, targetLang: string): Promise<TranslationValue> {
    return googleTranslate(
        text,
        deeplLanguageToGoogleLanguage(sourceLang),
        deeplLanguageToGoogleLanguage(targetLang)
    );
}

const showDeeplApiQuotaToast = onlyOnce(
    () => showToast({ text: "Deepl API quota exceeded. Falling back to Google Translate", variant: "critical" })
);

async function deeplTranslate(text: string, sourceLang: string, targetLang: string): Promise<TranslationValue> {
    if (!settings.store.deeplApiKey) {
        showToast({ text: "DeepL API key is not set. Resetting to Google", variant: "critical" });

        settings.store.service = "google";
        resetLanguageDefaults();

        return fallbackToGoogle(text, sourceLang, targetLang);
    }

    // CORS jumpscare
    const { status, data } = await Native.makeDeeplTranslateRequest(
        settings.store.service === "deepl-pro",
        settings.store.deeplApiKey,
        JSON.stringify({
            text: [text],
            target_lang: targetLang,
            source_lang: sourceLang.split("-")[0]
        })
    );

    switch (status) {
        case 200:
            break;
        case -1:
            throw "Failed to connect to DeepL API: " + data;
        case 403:
            throw "Invalid DeepL API key or version";
        case 456:
            showDeeplApiQuotaToast();
            return fallbackToGoogle(text, sourceLang, targetLang);
        default:
            throw new Error(`Failed to translate "${text}" (${sourceLang} -> ${targetLang})\n${status} ${data}`);
    }

    const { translations }: DeeplData = JSON.parse(data);
    const src = translations[0].detected_source_language;

    return {
        sourceLanguage: DeeplLanguages[src] ?? src,
        text: translations[0].text
    };
}

async function kagiTranslate(text: string, sourceLang: string, targetLang: string): Promise<TranslationValue> {
    const { status, data } = await Native.makeKagiTranslateRequest(
        settings.store.kagiSession, text, sourceLang, targetLang
    );

    switch (status) {
        case 200:
            break;
        case 401:
            throw "Invalid or expired Kagi session token";
        default:
            throw new Error(`Failed to translate "${text}" (${sourceLang} -> ${targetLang})\n${status} ${data}`);
    }

    const { detected_language, translation }: KagiData = data;

    return {
        sourceLanguage: detected_language.label,
        text: translation
    };
}
