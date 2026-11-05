/**
 * The wash behind the top of the landing page.
 *
 * Three layers, all of them derived from the active theme so the decoration
 * re-skins with the rest of the page:
 *
 *   1. two radial tints — the secondary accent and the action colour, mixed
 *      over transparency, which is exactly what `--accent-indigo` is named
 *      "the hero wash" for in styles/theme.css;
 *   2. a hairline grid in `--border-subtle`, the same ink-over-surface mix
 *      every separator in the app uses;
 *   3. a mask, so the grid dissolves instead of ending on a hard line.
 *
 * The tints sit over transparency rather than over a named surface because a
 * wash has to read on white paper and on near-black alike. Nothing here is a
 * literal colour, and nothing here is fixed to a scheme.
 *
 * All three are decoration: the wrapper is hidden from assistive tech and
 * cannot receive a pointer.
 */
export default function LandingBackdrop() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[44rem] overflow-hidden"
        >
            <div
                className="absolute inset-0"
                style={{
                    background: [
                        "radial-gradient(58% 46% at 20% 0%,",
                        "color-mix(in oklab, var(--accent-indigo) 20%, transparent),",
                        "transparent 70%)",
                        "radial-gradient(48% 42% at 82% 6%,",
                        "color-mix(in oklab, var(--primary) 15%, transparent),",
                        "transparent 72%)",
                    ].join(" "),
                }}
            />

            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: [
                        "linear-gradient(to right,",
                        "var(--border-subtle) 1px,",
                        "transparent 1px),",
                        "linear-gradient(to bottom,",
                        "var(--border-subtle) 1px,",
                        "transparent 1px)",
                    ].join(" "),
                    backgroundSize: "3.5rem 3.5rem",
                    /* Both spellings: Safari still needs the prefixed mask, and
                       an unprefixed-only declaration silently does nothing
                       there rather than failing loudly. */
                    maskImage:
                        "radial-gradient(78% 62% at 50% 0%, black, transparent 78%)",
                    WebkitMaskImage:
                        "radial-gradient(78% 62% at 50% 0%, black, transparent 78%)",
                }}
            />
        </div>
    );
}
