import type { ReactNode } from "react";

import { AppProvider } from "@/providers/AppProvider";
import { PresenceProvider } from "@/features/presence";
import { ConfirmProvider } from "@/components/common/confirm-dialog";

type Props = {
    children: ReactNode;
};

export function Providers({ children }: Props) {
    return (
        <AppProvider>
            <ConfirmProvider>
                <PresenceProvider>{children}</PresenceProvider>
            </ConfirmProvider>
        </AppProvider>
    );
}
