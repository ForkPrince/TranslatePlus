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

import { classNameFactory } from "@api/Styles";
import { onlyOnce } from "@utils/onlyOnce";
import { PluginNative } from "@utils/types";
import { showToast, Toasts } from "@webpack/common";

import { DeeplLanguages, deeplLanguageToGoogleLanguage, GoogleLanguages } from "../misc/languages";
import { resetLanguageDefaults, settings } from "../settings";

export const cl = classNameFactory("vc-trans-");

const Native = VencordNative.pluginHelpers.Translate as PluginNative<typeof import("./native")>;

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

export interface TranslationValue {
    sourceLanguage: string;
    text: string;
}

export const getLanguages = () => IS_WEB || settings.store.service === "google"
    ? GoogleLanguages
    : DeeplLanguages;

function isTokiPona(text: string) {
    const dictionary = /\b(?:leko|weka|pan|lete|linja|lipu|suli|nimi|akesi|misikeke|selo|ike|sijelo|sona|lili|pimeja|ante|jo|loje|telo|walo|kijetesantakalu|kasi|waso|wile|utala|lukin|sina|lape|ma|pilin|jasima|la|olin|pipi|meso|lawa|pi|pakala|oko|tan|ken|jaki|unpa|esun|seme|sitelen|len|kule|soko|open|ala|tenpo|lon|sinpin|pini|kokosila|mama|musi|monsi|mewika|taso|ona|mun|kiwen|tomo|mute|mi|nena|palisa|meli|laso|wawa|ale|kipisi|kulupu|ilo|lupa|nanpa|en|mu|jelo|kili|tonsi|moku|ni|kama|pu|poki|monsuta|sin|lasina|poka|soweli|sewi|elena|epiku|moli|pona|lanpan|alasa|anu|kute|uta|luka|suno|sama|awen|namako|suwi|noka|seli|mije|sike|jan|pali|tawa|inli|nasa|mani|wan|insa|nijon|nasin|kalama|ijo|toki|anpa|kala|kepeken|ko|kon|pana|tu|supa|kin|usawi|yupekosi)\b/gm;

    return (text.match(dictionary) || []).length >= text.split(/\s+/).length * 0.5;
}

function isSitelen(text: string) {
    const dictionary = /(?:󱤀|󱤁|󱤂|󱤃|󱤄|󱤅|󱤆|󱤇|󱤈|󱤉|󱤊|󱤋|󱤌|󱤍|󱤎|󱤏|󱤐|󱤑|󱤒|󱤓|󱤔|󱤕|󱤖|󱤗|󱤘|󱤙|󱤚|󱤛|󱤜|󱤝|󱤞|󱤟|󱤠|󱤡|󱤢|󱤣|󱤤|󱤥|󱤦|󱤧|󱤨|󱤩|󱤪|󱤫|󱤬|󱤭|󱤮|󱤯|󱤰|󱤱|󱤲|󱤳|󱤴|󱤵|󱤶|󱤷|󱤸|󱤹|󱤺|󱤻|󱤼|󱤽|󱤾|󱤿|󱥀|󱥁|󱥂|󱥃|󱥄|󱥅|󱥆|󱥇|󱥈|󱥉|󱥊|󱥋|󱥌|󱥍|󱥎|󱥏|󱥐|󱥑|󱥒|󱥓|󱥔|󱥕|󱥖|󱥗|󱥘|󱥙|󱥚|󱥛|󱥜|󱥝|󱥞|󱥟|󱥠|󱥡|󱥢|󱥣|󱥤|󱥥|󱥦|󱥧|󱥨|󱥩|󱥪|󱥫|󱥬|󱥭|󱥮|󱥯|󱥰|󱥱|󱥲|󱥳|󱥴|󱥵|󱥶|󱥷|󱦠|󱦡|󱦢|󱦣|󱥸|󱥹|󱥺|󱥻|󱥼|󱥽|󱥾|󱥿|󱦀|󱦁|󱦂|󱦃|󱦄|󱦅|󱦆|󱦇|󱦈|󱦐|󱦑|󱦒|󱦓|󱦔|󱦕|󱦖|󱦗|󱦘|󱦙|󱦚|󱦛|󱦜|󱦝)/gm;

    return dictionary.test(text);
}

function isShavian(text: string) {
    const shavianRegex = /[\u{10450}-\u{1047F}]+/u;

    return shavianRegex.test(text);
}

async function translateShavian(message: string) {
    const dictionary = await (await fetch("https://forkprince.github.io/TranslatePlus/shavian.json")).json();

    const punctuationMap: Record<string, string> = {
        '"': "\"",
        "«": "\"",
        "»": "\"",
        ",": ",",
        "!": "!",
        "?": "?",
        ".": ".",
        "(": "(",
        ")": ")",
        "/": "/",
        ";": ";",
        ":": ":"
    };

    let translated = "";
    const words = message.split(/\s+/);

    for (let word of words) {
        let punctuationBefore = "", punctuationAfter = "";

        if (word[0] in punctuationMap) {
            punctuationBefore = punctuationMap[word[0]];
            word = word.slice(1);
        }

        if (word[word.length - 1] in punctuationMap) {
            punctuationAfter = punctuationMap[word[word.length - 1]];
            word = word.slice(0, -1);
        }

        translated += punctuationBefore;

        if (word in dictionary) translated += dictionary[word];
        else translated += word;

        translated += punctuationAfter + " ";
    }

    return translated.trim();
}

async function translateSitelen(message: string) {
    message = Array.from(message).join(" ");

    const dictionary = await (await fetch("https://forkprince.github.io/TranslatePlus/sitelen-pona.json")).json();

    const sorted = Object.keys(dictionary).sort((a, b) => b.length - a.length);

    const pattern = new RegExp(`(${sorted.join("|")})`, "g");

    const translate = message.replace(pattern, match => dictionary[match]);

    return translate;
}

export async function translate(kind: "received" | "sent", text: string): Promise<TranslationValue> {
    const { toki, sitelen, shavian } = settings.store;

    try {
        if ((isTokiPona(text) || isSitelen(text)) && (toki || sitelen)) {
            let processedText = text;
            if (isSitelen(text) && sitelen) processedText = await translateSitelen(text);

            const tokiResponse = await fetch("https://toki.twint.my.id/v1", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text: processedText,
                    src: "tl",
                    target: "en"
                })
            });

            const tokiTranslate = await tokiResponse.json();
            const translatedText = tokiTranslate.translation[0];
            const targetLang = settings.store[`${kind}Output`];

            return {
                sourceLanguage: "Toki Pona",
                text: targetLang === "en" ? translatedText : (await googleTranslate(translatedText, "en", targetLang)).text
            };
        } else if (isShavian(text) && shavian) {
            const translatedText = await translateShavian(text);
            const targetLang = settings.store[`${kind}Output`];

            return {
                sourceLanguage: "Shavian",
                text: targetLang === "en" ? translatedText : (await googleTranslate(translatedText, "en", targetLang)).text
            };
        }
    } catch (e) {
        console.error("Artistic language translation failed, falling back to standard translation:", e);
    }

    const translate = IS_WEB || settings.store.service === "google"
        ? googleTranslate
        : deeplTranslate;

    try {
        return await translate(
            text,
            settings.store[`${kind}Input`],
            settings.store[`${kind}Output`]
        );
    } catch (e) {
        const userMessage = typeof e === "string"
            ? e
            : "Something went wrong. If this issue persists, please check the console or ask for help in the support server.";

        showToast(userMessage, Toasts.Type.FAILURE);

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
    () => showToast("Deepl API quota exceeded. Falling back to Google Translate", Toasts.Type.FAILURE)
);

async function deeplTranslate(text: string, sourceLang: string, targetLang: string): Promise<TranslationValue> {
    if (!settings.store.deeplApiKey) {
        showToast("DeepL API key is not set. Resetting to Google", Toasts.Type.FAILURE);

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
