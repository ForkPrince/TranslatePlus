/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { showToast } from "@webpack/common";
import { onlyOnce } from "@utils/onlyOnce";

import { DeeplLanguages, deeplLanguageToGoogleLanguage } from "../../misc/languages";
import { resetLanguageDefaults, settings } from "../../settings";
import type { TranslationValue } from "./types";
import { googleTranslate } from "./google";
import { Native } from "./native";

interface DeeplData {
    translations: {
        detected_source_language: string;
        text: string;
    }[];
}

function fallbackToGoogle(text: string, sourceLang: string, targetLang: string): Promise<TranslationValue> {
    return googleTranslate(text, deeplLanguageToGoogleLanguage(sourceLang), deeplLanguageToGoogleLanguage(targetLang));
}

const showDeeplApiQuotaToast = onlyOnce(() => showToast({ text: "Deepl API quota exceeded. Falling back to Google Translate", variant: "critical" }));

export async function deeplTranslate(text: string, sourceLang: string, targetLang: string): Promise<TranslationValue> {
    if (!settings.store.deeplApiKey) {
        showToast({ text: "DeepL API key is not set. Resetting to Google", variant: "critical" });

        settings.store.service = "google";
        resetLanguageDefaults();

        return fallbackToGoogle(text, sourceLang, targetLang);
    }

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