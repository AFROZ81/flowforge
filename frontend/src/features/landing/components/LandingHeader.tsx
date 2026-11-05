import { useEffect, useState } from "react";

import Logo from "@/components/layout/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";

import { CONTAINER } from "../lib/landing";

/**
 * The brand band.
 *
 * Sticky, but wearing a ground only once the page has moved under it. At the
 * top of a hero a bordered bar is a seam across the composition; after
 * scrolling it is the thing that keeps the page orientable, and it needs to be
 * legible against whatever is passing beneath it. The threshold is eight
 * pixels so a single line of movement commits to the change, and the border is
 * present but transparent at rest — a `display` swap there would shift every
 * row below it.
 *
 * There is no account action up here. The hero carries both, and a copy in
 * the corner is a second place to decide before the page has said what it is.
 *
 * What is here instead is the theme switch, which is the one control a
 * landing page for a four-scheme product should have: it works immediately,
 * it is stored under the same key Settings uses, and it lets the visitor
 * judge every colour on this page in the scheme they actually read in.
 */
export default function LandingHeader() {
    const [lifted, setLifted] = useState(false);

    useEffect(() => {
        const onScroll = () => setLifted(window.scrollY > 8);

        /* The listener is attached after paint, so a page opened mid-scroll
           would otherwise keep the transparent treatment until the first
           wheel tick. */
        onScroll();

        window.addEventListener("scroll", onScroll, { passive: true });

        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={cn(
                "sticky top-0 z-30 border-b backdrop-blur-md transition-colors duration-200",
                lifted
                    ? "border-border/70 bg-background/85"
                    : "border-transparent bg-transparent"
            )}
        >
            <div
                className={`${CONTAINER} flex h-14 items-center justify-between gap-6 sm:h-16`}
            >
                <Logo size="lg" tagline={null} />

                {/* No `shrink-0` here: when the switch is open its option
                    track has to be the thing that gives on a narrow screen,
                    and it scrolls inside its own rounded rail to do it. */}
                <ThemeToggle />
            </div>
        </header>
    );
}
