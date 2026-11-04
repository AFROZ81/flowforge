import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type Figure = {
    label: string;
    /** Pre-formatted by the caller, which knows whether it is a count or a percent. */
    value: string;
    tone?: "default" | "danger" | "success" | "warning" | "neutral";
    /**
     * Share of a relevant whole, from 0 to 1, drawn as a bar under the number.
     * A count on its own asks the reader to supply the denominator; this states
     * it. The caller decides what the whole is and labels it in `caption`.
     */
    share?: number;
    /** One line of derived fact - "34% of your open", never a slogan. */
    caption?: string;
    icon?: LucideIcon;
};

const VALUE_TONE: Record<NonNullable<Figure["tone"]>, string> = {
    default: "text-foreground",
    danger: "text-destructive",
    success: "text-success",
    warning: "text-warning",
    neutral: "text-foreground",
};

const BAR_TONE: Record<NonNullable<Figure["tone"]>, string> = {
    default: "bg-primary",
    danger: "bg-destructive",
    success: "bg-success",
    warning: "bg-warning",
    neutral: "bg-muted-foreground/50",
};

const ICON_TONE: Record<NonNullable<Figure["tone"]>, string> = {
    default: "bg-primary-subtle text-primary",
    danger: "bg-destructive/10 text-destructive",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    neutral: "bg-surface-sunken text-muted-foreground",
};

/**
 * Key figures in a row of cards.
 *
 * Every figure gets its own border, radius and shadow, matching every other
 * card on the two pages that use this. The row used to be a single hairline-
 * ruled surface, which read as a table row the page had grown: the seams were
 * 1px of --border with no canvas between them, and each progress track ran
 * straight into the vertical divider until the whole strip looked like a grid.
 *
 * `auto-fit` with a 10rem floor gives two columns on a 348px phone; a wider
 * floor makes auto-fit give up and stack all four.
 */
export default function FigureStrip({ figures }: { figures: Figure[] }) {
    return (
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(10rem,1fr))] sm:gap-4">
            {figures.map((figure) => {
                const percent =
                    figure.share === undefined
                        ? null
                        : Math.min(100, Math.max(0, figure.share * 100));

                const tone = figure.tone ?? "default";
                const Icon = figure.icon;

                return (
                    <div
                        key={figure.label}
                        className="rounded-xl border bg-card px-4 py-3.5 shadow-xs"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="text-xs leading-none text-muted-foreground">
                                    {figure.label}
                                </div>

                                <div
                                    className={cn(
                                        "mt-2 text-[1.75rem] leading-none font-semibold tracking-[-0.025em] tabular-nums",
                                        VALUE_TONE[tone]
                                    )}
                                >
                                    {figure.value}
                                </div>
                            </div>

                            {Icon ? (
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                                        ICON_TONE[tone]
                                    )}
                                >
                                    <Icon className="size-4" strokeWidth={1.9} />
                                </span>
                            ) : null}
                        </div>

                        {percent !== null ? (
                            <div
                                aria-hidden="true"
                                className="mt-3 h-1 rounded-full bg-foreground/10"
                            >
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-[width] duration-200 ease-out",
                                        BAR_TONE[tone]
                                    )}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        ) : null}

                        {figure.caption ? (
                            <div className="mt-2 truncate text-[11px] leading-none tabular-nums text-muted-foreground">
                                {figure.caption}
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
