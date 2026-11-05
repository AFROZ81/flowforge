import Logo from "@/components/layout/Logo";

import { CONTAINER } from "../lib/landing";

/**
 * The close of the page.
 *
 * The lockup and nothing else. Every account route is already above it —
 * `Sign in` in the header and both actions in the hero — so repeating them
 * here was a fourth copy of a link the visitor has already passed twice, and
 * the stack paragraph was a description at the one place on the page where
 * nobody is still deciding whether to read.
 *
 * The band stays because the page needs to end on an edge rather than on a
 * section's own bottom margin.
 */
export default function LandingFooter() {
    return (
        <footer className="border-t bg-surface-muted/40">
            <div className={`${CONTAINER} py-6 sm:py-7`}>
                <Logo size="md" tagline={null} />
            </div>
        </footer>
    );
}
