import type { ReactNode } from "react";

import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

import { queryClient } from "@/lib/queryClient";

type Props = {
    children: ReactNode;
};

export function AppProvider({ children }: Props) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            /*
             * The product ships as a light enterprise theme. Leaving the
             * choice remembered means a user's one toggle survives a reload
             * rather than snapping back.
             */
            storageKey="flowforge.theme"
            disableTransitionOnChange
        >
            <QueryClientProvider client={queryClient}>
                {children}

                {/*
                 * One toaster for the whole app. It used to be mounted here
                 * *and* in main.tsx, which duplicated every toast.
                 */}
                <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    expand={false}
                    offset={{ top: "calc(var(--topbar-height) + 0.75rem)", right: "1rem" }}
                    mobileOffset={{ top: "calc(var(--topbar-height) + 0.5rem)", right: "0.5rem" }}
                    toastOptions={{
                        duration: 4500,
                    }}
                />
            </QueryClientProvider>
        </ThemeProvider>
    );
}
