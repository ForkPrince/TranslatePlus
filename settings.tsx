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

import { definePluginSettings } from "@api/Settings";
import { Button } from "@components/Button";
import { OptionType } from "@utils/types";

import { openTranslateModal } from "./utils/modal";

export const settings = definePluginSettings({
    receivedInput: {
        type: OptionType.STRING,
        description: "Language incoming messages are translated from",
        default: "auto",
        hidden: true
    },
    receivedOutput: {
        type: OptionType.STRING,
        description: "Language incoming messages are translated to",
        default: "en",
        hidden: true
    },
    sentInput: {
        type: OptionType.STRING,
        description: "Language your messages are translated from",
        default: "auto",
        hidden: true
    },
    sentOutput: {
        type: OptionType.STRING,
        description: "Language your messages are translated to",
        default: "en",
        hidden: true
    },
    service: {
        type: OptionType.SELECT,
        description: IS_WEB ? "Translation provider (not available on web)" : "Translation provider",
        hidden: IS_WEB,
        options: [
            { label: "Google Translate — no API key required", value: "google", default: true },
            { label: "Yandex Translate — no API key required", value: "yandex" },
            { label: "DeepL Free — API key required", value: "deepl" },
            { label: "DeepL Pro — API key required", value: "deepl-pro" },
            { label: "Kagi Translate — API key required", value: "kagi" }
        ] as const,
        onChange: resetLanguageDefaults
    },
    deeplApiKey: {
        type: OptionType.STRING,
        displayName: "DeepL API Key",
        description: "Your DeepL API key (from deepl.com/your-account)",
        default: ""
    },
    kagiSession: {
        type: OptionType.STRING,
        description: "Your Kagi session token (from kagi.com/settings?p=user_details)",
        default: ""
    },
    autoTranslate: {
        type: OptionType.BOOLEAN,
        description: "Automatically translate your messages before sending. You can also Shift+click or right-click the translate button to toggle this",
        default: false
    },
    showAutoTranslateTooltip: {
        type: OptionType.BOOLEAN,
        description: "Show a tooltip on the chat bar button when a message is auto-translated",
        default: true
    },

    toki: {
        type: OptionType.BOOLEAN,
        description: "Enable Toki Pona translation",
        default: true
    },
    tokiApiVersion: {
        type: OptionType.SELECT,
        displayName: "Toki Pona API Version",
        description: "Translation API used for Toki Pona and Sitelen Pona",
        options: [
            { label: "v1 — M2M100 (multi-language)", value: "v1", default: true },
            { label: "v2 — GPT-2 (Toki Pona ↔ English)", value: "v2" }
        ] as const
    },
    sitelen: {
        type: OptionType.BOOLEAN,
        description: "Enable Sitelen Pona translation",
        default: true
    },
    shavian: {
        type: OptionType.BOOLEAN,
        description: "Enable Shavian translation",
        default: true
    },

    manageTranslateSettings: {
        type: OptionType.COMPONENT,
        component: () => (
            <Button onClick={openTranslateModal}>
                Customize translation languages & Auto-Translate
            </Button>
        )
    }
}, {
    deeplApiKey: {
        hidden() { return this.store.service !== "deepl" && this.store.service !== "deepl-pro"; }
    },
    kagiSession: {
        hidden() { return this.store.service !== "kagi"; }
    }
}).withPrivateSettings<{
    dismissedAutoTranslateAlert?: boolean;
}>();

export function resetLanguageDefaults() {
    if (IS_WEB || settings.store.service === "google" || settings.store.service === "yandex" || settings.store.service === "kagi") {
        settings.store.receivedInput = "auto";
        settings.store.receivedOutput = "en";
        settings.store.sentInput = "auto";
        settings.store.sentOutput = "en";
    } else {
        settings.store.receivedInput = "";
        settings.store.receivedOutput = "en-us";
        settings.store.sentInput = "";
        settings.store.sentOutput = "en-us";
    }
}
