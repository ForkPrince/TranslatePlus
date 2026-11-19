/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export interface TranslationValue {
    sourceLanguage: string;
    text: string;
}

export type Translator = (text: string, sourceLang: string, targetLang: string) => Promise<TranslationValue>;