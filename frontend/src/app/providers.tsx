import type { ReactNode } from "react";

import { AppProvider } from "@/providers/AppProvider";
import { PresenceProvider } from "@/features/presence";
import { ConfirmProvider } from "@/components/common/confirm-dialog";
import { Announcer } from "@/components/common/Announcer";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { CommandPalette } from "@/features/command-palette/CommandPalette";

type Props = {
    children: ReactNode;
};

export function Providers({ children }: Props) {
    return (
        <AppProvider>
            <ConfirmProvider>
                <PresenceProvider>
                    {children}
                    <Announcer />
                    <OfflineIndicator />
                    <CommandPalette />
                </PresenceProvider>
            </ConfirmProvider>
        </AppProvider>
    );
}
