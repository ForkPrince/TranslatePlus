/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export function isTokiPona(text: string) {
    return (text.match(/\b(?:leko|weka|pan|lete|linja|lipu|suli|nimi|akesi|misikeke|selo|ike|sijelo|sona|lili|pimeja|ante|jo|loje|telo|walo|kijetesantakalu|kasi|waso|wile|utala|lukin|sina|lape|ma|pilin|jasima|la|olin|pipi|meso|lawa|pi|pakala|oko|tan|ken|jaki|unpa|esun|seme|sitelen|len|kule|soko|open|ala|tenpo|lon|sinpin|pini|kokosila|mama|musi|monsi|mewika|taso|ona|mun|kiwen|tomo|mute|mi|nena|palisa|meli|laso|wawa|ale|kipisi|kulupu|ilo|lupa|nanpa|en|mu|jelo|kili|tonsi|moku|ni|kama|pu|poki|monsuta|sin|lasina|poka|soweli|sewi|elena|epiku|moli|pona|lanpan|alasa|anu|kute|uta|luka|suno|sama|awen|namako|suwi|noka|seli|mije|sike|jan|pali|tawa|inli|nasa|mani|wan|insa|nijon|nasin|kalama|ijo|toki|anpa|kala|kepeken|ko|kon|pana|tu|supa|kin|usawi|yupekosi)\b/gm) || []).length >= text.split(/\s+/).length * 0.5;
}

export function isSitelen(text: string) {
    return /(?:󱤀|󱤁|󱤂|󱤃|󱤄|󱤅|󱤆|󱤇|󱤈|󱤉|󱤊|󱤋|󱤌|󱤍|󱤎|󱤏|󱤐|󱤑|󱤒|󱤓|󱤔|󱤕|󱤖|󱤗|󱤘|󱤙|󱤚|󱤛|󱤜|󱤝|󱤞|󱤟|󱤠|󱤡|󱤢|󱤣|󱤤|󱤥|󱤦|󱤧|󱤨|󱤩|󱤪|󱤫|󱤬|󱤭|󱤮|󱤯|󱤰|󱤱|󱤲|󱤳|󱤴|󱤵|󱤶|󱤷|󱤸|󱤹|󱤺|󱤻|󱤼|󱤽|󱤾|󱤿|󱥀|󱥁|󱥂|󱥃|󱥄|󱥅|󱥆|󱥇|󱥈|󱥉|󱥊|󱥋|󱥌|󱥍|󱥎|󱥏|󱥐|󱥑|󱥒|󱥓|󱥔|󱥕|󱥖|󱥗|󱥘|󱥙|󱥚|󱥛|󱥜|󱥝|󱥞|󱥟|󱥠|󱥡|󱥢|󱥣|󱥤|󱥥|󱥦|󱥧|󱥨|󱥩|󱥪|󱥫|󱥬|󱥭|󱥮|󱥯|󱥰|󱥱|󱥲|󱥳|󱥴|󱥵|󱥶|󱥷|󱦠|󱦡|󱦢|󱦣|󱥸|󱥹|󱥺|󱥻|󱥼|󱥽|󱥾|󱥿|󱦀|󱦁|󱦂|󱦃|󱦄|󱦅|󱦆|󱦇|󱦈|󱦐|󱦑|󱦒|󱦓|󱦔|󱦕|󱦖|󱦗|󱦘|󱦙|󱦚|󱦛|󱦜|󱦝)/gm.test(text);
}

async function toSitelen(message: string) {
    const dictionary = await (await fetch("https://forkprince.github.io/TranslatePlus/sitelen-pona.json")).json();
    const pattern = new RegExp(`(${Object.keys(dictionary).sort((a, b) => b.length - a.length).join("|")})`, "g");

    return Array.from(message)
        .join(" ")
        .replace(pattern, match => dictionary[match]);
}

export async function toEnglish(text: string, convertSitelen: boolean) {
    const processed = convertSitelen ? await toSitelen(text) : text;

    const res = await fetch("https://toki.twint.pp.ua/v1", {
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
    });

    const data = await res.json();
    return data.translation[0] as string;
}