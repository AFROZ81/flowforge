import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { ThemeProvider, useTheme } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/lib/queryClient";
import { assertThemeCoverage } from "@/lib/themes";

type Props = {
    children: ReactNode;
};

/**
 * Side effects that belong to the theme, not to any page.
 *
 * Lives inside ThemeProvider so it can see the resolved theme, and nowhere
 * else — components never read a theme id to decide a colour.
 */
function ThemeEffects() {
    const { theme, resolvedTheme } = useTheme();

    const mounted = useRef(false);

    /* ---------- native chrome follows the surface scheme ----------
       Read from the token itself rather than a second list of hexes, so the
       address bar can never disagree with the page it is sitting on. */
    useEffect(() => {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) return;

        const page = getComputedStyle(document.documentElement)
            .getPropertyValue("--background")
            .trim();

        if (page) meta.setAttribute("content", page);
    }, [theme, resolvedTheme]);

    /* ---------- cross-fade ----------
       Without this, only the handful of elements that happen to declare a
       transition animate, and the rest of the UI snaps — which reads as a
       glitch rather than a change of theme. The class is removed straight
       after so ordinary hover and focus timing is untouched. */
    useEffect(() => {
        // Nothing to animate on first paint; the theme was already applied.
        if (!mounted.current) {
            mounted.current = true;
            return;
        }

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const root = document.documentElement;
        root.classList.add("theme-transition");

        const timer = window.setTimeout(
            () => root.classList.remove("theme-transition"),
            240
        );

        return () => window.clearTimeout(timer);
    }, [theme, resolvedTheme]);

    /* ---------- registry / token-layer drift guard (dev only) ---------- */
    useEffect(() => {
        assertThemeCoverage();
    }, []);

    return null;
}

export function AppProvider({ children }: Props) {
    return (
        <ThemeProvider
            /*
             * Two attributes, two meanings:
             *   data-theme — identity. The token layer selects on it.
             *   class      — family. `.dark` / `.onyx` drive the `dark:`
             *                utilities, so the ~30 existing family rules keep
             *                working without rewriting them as tokens.
             */
            attribute={["data-theme", "class"]}
            value={{
                light: "light",
                dark: "dark",
                parchment: "parchment",
                onyx: "onyx",
            }}
            /*
             * Follow the OS until somebody chooses. The previous default was
             * "light", which forced a look on anyone whose system was already
             * in dark mode.
             */
            defaultTheme="system"
            enableSystem
            /*
             * Same key as before: choices people already made (light, dark,
             * system) are still valid ids in the new registry, so nothing is
             * silently lost on deploy.
             */
            storageKey="flowforge.theme"
        >
            <ThemeEffects />

            <QueryClientProvider client={queryClient}>
                {children}

                {/*
                 * One toaster for the whole app, mounted once. It used to be
                 * mounted twice (here and in main.tsx), which rendered every
                 * toast twice, and it used to carry its own placement here
                 * while sonner.tsx chose the icons - two halves of one
                 * decision. Everything about where and how a toast looks is
                 * the wrapper's business now.
                 */}
                <Toaster />
            </QueryClientProvider>
        </ThemeProvider>
    );
}
