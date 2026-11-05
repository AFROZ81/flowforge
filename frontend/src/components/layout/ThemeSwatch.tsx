import { Monitor } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ThemePreference } from "@/lib/themes";

const SYSTEM_VALUE: ThemePreference = "system";

/**
 * A miniature of a theme: surface on the left half, accent on the right.
 *
 * The colours are not hardcoded — `data-theme` re-points the tokens on this
 * element alone, so the swatch shows the real palette whatever theme the app
 * is currently wearing. That depends on `light` being present in the selector
 * list of the token blocks in styles/theme.css; until it was, the light chip
 * silently inherited the running theme and looked like a duplicate of it.
 */
export default function ThemeSwatch({
    themeId,
    className,
}: {
    themeId: ThemePreference;
    className?: string;
}) {
    if (themeId === SYSTEM_VALUE) {
        /*
         * "System" is not a palette, so it cannot be a surface-and-accent
         * circle like the other four. It keeps the circle to hold the row's
         * rhythm and a dashed edge to say "derived", with the monitor glyph
         * inside it.
         *
         * Three things make it read cleanly where the previous version did
         * not. The glyph is sized as a share of the disc rather than a fixed
         * step, so it is as comfortable in Settings' 16px as in the header's
         * 20px instead of crowding the dashes. The stroke is lighter than the
         * default, because at this size the screen, its stem and its base
         * otherwise merge. And the disc is filled with `--surface`, so the
         * glyph sits on a ground rather than on the track showing through.
         */
        return (
            <span
                aria-hidden="true"
                className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-border-strong bg-surface",
                    className
                )}
            >
                <Monitor
                    className="size-[55%] text-muted-foreground"
                    strokeWidth={1.75}
                />
            </span>
        );
    }

    return (
        <span
            aria-hidden="true"
            data-theme={themeId}
            className={cn(
                "relative flex size-6 shrink-0 overflow-hidden rounded-full border border-border-strong",
                className
            )}
            style={{ background: "var(--background)" }}
        >
            <span
                className="absolute inset-y-0 right-0 w-1/2"
                style={{ background: "var(--primary)" }}
            />
        </span>
    );
}
