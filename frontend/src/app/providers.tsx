import type { ReactNode } from "react";

import { AppProvider } from "@/providers/AppProvider";
import { PresenceProvider } from "@/features/presence";

type Props = {
    children: ReactNode;
};

export function Providers({
    children,
}: Props) {
    return (
        <AppProvider>
            <PresenceProvider>
                {children}
            </PresenceProvider>
        </AppProvider>
    );
}