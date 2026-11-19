/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { TranslationValue } from "./types";
import { settings } from "../../settings";
import { Native } from "./native";

interface KagiData {
    translation: string;
    detected_language: {
        label: string;
    };
}

export async function kagiTranslate(text: string, sourceLang: string, targetLang: string): Promise<TranslationValue> {
    const { status, data } = await Native.makeKagiTranslateRequest(settings.store.kagiSession, text, sourceLang, targetLang);

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