import type { ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { queryClient } from "@/lib/queryClient";

type Props = {
    children: ReactNode;
};

export function AppProvider({ children }: Props) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}

            <Toaster
                position="top-right"
                richColors
                closeButton
            />
        </QueryClientProvider>
    );
}