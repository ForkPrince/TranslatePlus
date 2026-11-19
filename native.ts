/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// Vencord/Equicord only discover native helpers at the plugin root,
// so re-export the implementation kept in misc/.
export * from "./misc/native";
