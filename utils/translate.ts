/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classNameFactory } from "@utils/css";
import { showToast } from "@webpack/common";

import { isSitelen, isTokiPona, toEnglish as tokiPonaToEnglish } from "./translators/tokiPona";
import { DeeplLanguages, GoogleLanguages, KagiLanguages } from "../misc/languages";
import { isShavian, toEnglish as shavianToEnglish } from "./translators/shavian";
import type { TranslationValue, Translator } from "./translators/types";
import { googleTranslate } from "./translators/google";
import { yandexTranslate } from "./translators/yandex";
import { deeplTranslate } from "./translators/deepl";
import { kagiTranslate } from "./translators/kagi";
import { settings } from "../settings";

export type { TranslationValue };

export const cl = classNameFactory("ec-trans-");

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

function getTranslator(): Translator {
    if (IS_WEB) {
        return googleTranslate;
    }
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
}

export async function translate(kind: "received" | "sent", text: string): Promise<TranslationValue> {
    const { toki, sitelen, shavian } = settings.store;
    const target = settings.store[`${kind}Output`];
    const machine = getTranslator();

    const out = async (sourceLanguage: string, translated: string) => {
        if (target === "en") return { sourceLanguage, text: translated };

        const { text: translatedText } = await machine(translated, "en", target);
        return { sourceLanguage, text: translatedText };
    };

    try {
        const sitelenText = sitelen && isSitelen(text);
        if ((toki && isTokiPona(text)) || sitelenText) return await out("Toki Pona", await tokiPonaToEnglish(text, sitelenText));

        if (shavian && isShavian(text)) return await out("Shavian", await shavianToEnglish(text));
    } catch (e) {
        console.error("Custom language translation failed, using fallback:", e);
    }

    try {
        return await machine(text, settings.store[`${kind}Input`], target);
    } catch (e) {
        const userMessage = typeof e === "string" ? e : "Something went wrong. If this issue persists, please check the console or ask for help in the support server.";

        showToast({ text: userMessage, variant: "critical" });

        throw e instanceof Error ? e : new Error(userMessage);
    }
}
