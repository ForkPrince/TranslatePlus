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

import { ChatBarButton, ChatBarButtonFactory } from "@api/ChatButtons";
import { classes } from "@utils/misc";
import { openModal } from "@utils/modal";
import { IconComponent } from "@utils/types";
import { Alerts, Forms, Tooltip, useEffect, useState } from "@webpack/common";

import { settings } from "./settings";
import { TranslateModal } from "./TranslateModal";
import { cl } from "./utils";

export const TranslateIcon: IconComponent = ({ height = 20, width = 20, className }) => {
    return (
        <svg
            viewBox="0 96 960 960"
            height={height}
            width={width}
            className={classes(cl("icon"), className)}
        >
            <path fill="currentColor" d="m475 976 181-480h82l186 480h-87l-41-126H604l-47 126h-82Zm151-196h142l-70-194h-2l-70 194Zm-466 76-55-55 204-204q-38-44-67.5-88.5T190 416h87q17 33 37.5 62.5T361 539q45-47 75-97.5T487 336H40v-80h280v-80h80v80h280v80H567q-22 69-58.5 135.5T419 598l98 99-30 81-127-122-200 200Z" />
            <path fill="currentColor" d="m 830.17456,136.43701 c -11.54729,0 -20.84473,8.71252 -20.84473,19.53369 v 66.21826 h -66.21826 c -10.82122,0 -19.53369,9.29373 -19.53369,20.84107 0,11.54734 8.71247,20.84473 19.53369,20.84473 h 66.21826 v 66.21826 c 0,10.8212 9.29742,19.53369 20.84473,19.53369 11.54731,0 20.84106,-8.71249 20.84106,-19.53369 v -66.21826 h 66.21827 c 10.82124,0 19.53369,-9.29737 19.53369,-20.84473 0,-11.54736 -8.71245,-20.84107 -19.53369,-20.84107 H 851.01562 V 155.9707 c 0,-10.82117 -9.29377,-19.53369 -20.84106,-19.53369 z" />
            <rect fill="currentColor" width="0.42110577" height="2.1055288" x="848.52814" y="112.42313" ry="0.2105529" />
        </svg>
    );
};

export let setShouldShowTranslateEnabledTooltip: undefined | ((show: boolean) => void);

export const TranslateChatBarIcon: ChatBarButtonFactory = ({ isMainChat }) => {
    const { autoTranslate } = settings.use(["autoTranslate"]);

    const [shouldShowTranslateEnabledTooltip, setter] = useState(false);
    useEffect(() => {
        setShouldShowTranslateEnabledTooltip = setter;
        return () => setShouldShowTranslateEnabledTooltip = undefined;
    }, []);

    if (!isMainChat) return null;

    const toggle = () => {
        const newState = !autoTranslate;
        settings.store.autoTranslate = newState;
        if (newState && settings.store.showAutoTranslateAlert !== false)
            Alerts.show({
                title: "Vencord Auto-Translate Enabled",
                body: <>
                    <Forms.FormText>
                        You just enabled Auto Translate! Any message <b>will automatically be translated</b> before being sent.
                    </Forms.FormText>
                </>,
                confirmText: "Disable Auto-Translate",
                cancelText: "Got it",
                secondaryConfirmText: "Don't show again",
                onConfirmSecondary: () => settings.store.showAutoTranslateAlert = false,
                onConfirm: () => settings.store.autoTranslate = false,
                // troll
                confirmColor: "vc-notification-log-danger-btn",
            });
    };

    const button = (
        <ChatBarButton
            tooltip="Open Translate Modal"
            onClick={e => {
                if (e.shiftKey) return toggle();

                openModal(props => (
                    <TranslateModal rootProps={props} />
                ));
            }}
            onContextMenu={toggle}
            buttonProps={{
                "aria-haspopup": "dialog"
            }}
        >
            <TranslateIcon className={cl({ "auto-translate": autoTranslate, "chat-button": true })} />
        </ChatBarButton>
    );

    if (shouldShowTranslateEnabledTooltip && settings.store.showAutoTranslateTooltip)
        return (
            <Tooltip text="Auto Translate Enabled" forceOpen>
                {() => button}
            </Tooltip>
        );

    return button;
};
