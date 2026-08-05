import type { ReactNode } from "react";
import { AppProvider } from "@/providers/AppProvider";

type Props = {
    children: ReactNode;
};

export function Providers({
    children,
}: Props) {
    return (
        <AppProvider>
            {children}
        </AppProvider>
    );
}