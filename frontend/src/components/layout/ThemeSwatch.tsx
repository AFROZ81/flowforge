import { Monitor } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ThemePreference } from "@/lib/themes";

const SYSTEM_VALUE: ThemePreference = "system";

/**
 * A miniature of a theme: surface on the left half, accent on the right.
 *
 * The colours are not hardcoded — `data-theme` re-points the tokens on this
 * element alone, so the swatch shows the real palette whatever theme the app is
 * currently wearing. Used by the top bar picker and by Settings.
 */
export default function ThemeSwatch({
    themeId,
    className,
}: {
    themeId: ThemePreference;
    className?: string;
}) {
    if (themeId === SYSTEM_VALUE) {
        return (
            <span
                aria-hidden="true"
                className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-border-strong bg-surface",
                    className
                )}
            >
                <Monitor className="size-3.5 text-muted-foreground" />
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
