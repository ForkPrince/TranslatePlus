/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { PluginNative } from "@utils/types";

export const Native = VencordNative.pluginHelpers["Translate+"] as PluginNative<typeof import("../../native")>;