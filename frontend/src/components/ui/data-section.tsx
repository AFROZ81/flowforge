import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type DataSectionProps = {
    /** Ordinal shown before the title. Omit for an unnumbered section. */
    number?: number;
    title: string;
    /** A short factual qualifier, e. g. what a column is a share of. */
    note?: string;
    /** Wayfinding glyph. Sections read as a document, not a wall of text. */
    icon?: LucideIcon;
    children: ReactNode;
    className?: string;
};

/**
 * A titled, bordered block of data.
 *
 * Reports and the dashboard share this so a numbered section means the same
 * thing on every page, and so a change like the identity tile lands in both
 * places at once instead of one drifting.
 *
 * A flex column with a fixed header, so a caller placed in a stretched grid
 * row can hand its own height to the content with `flex-1` rather than
 * leaving that height as empty space under the last row.
 */
export default function DataSection({
    number,
    title,
    note,
    icon: Icon,
    children,
    className,
}: DataSectionProps) {
    return (
        <section
            className={cn(
                "flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs",
                className
            )}
        >
            <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3">
                {Icon ? (
                    <span
                        aria-hidden="true"
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary"
                    >
                        <Icon className="size-4" strokeWidth={1.9} />
                    </span>
                ) : null}

                <div className="min-w-0 flex-1">
                    <h3 className="flex min-w-0 items-baseline gap-2 text-sm leading-snug font-semibold tracking-[-0.01em] text-foreground">
                        {number !== undefined ? (
                            <span className="shrink-0 tabular-nums text-muted-foreground">
                                {number}.
                            </span>
                        ) : null}
                        <span className="truncate">{title}</span>
                    </h3>

                    {note ? (
                        <p className="mt-0.5 truncate text-xs leading-relaxed text-muted-foreground">
                            {note}
                        </p>
                    ) : null}
                </div>
            </div>
            {children}
        </section>
    );
}
