import type { ReactNode } from "react";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type PillOption<T extends string> = {
    id: T;
    /** Visible text in `labeled`, the accessible name and tooltip in `icon`. */
    label: string;
    /** Swatch or glyph before the label. Required by the `icon` variant. */
    preview?: ReactNode;
};

type PillGroupProps<T extends string> = {
    /** Names the whole control to assistive tech. */
    label: string;
    /** Lets a disclosure button point at the group with `aria-controls`. */
    id?: string;
    value: T;
    options: PillOption<T>[];
    onChange: (value: T) => void;
    /**
     * `labeled` - swatch plus text, the width a settings row has to spare.
     * `icon` - the swatch alone, for a header where the same five choices have
     * to fit in about forty pixels each.
     */
    variant?: "labeled" | "icon";
    className?: string;
};

/**
 * A raised-on-sunken pill for a value that takes one of a few options.
 *
 * Shared by Settings and the landing header so the two are the same object:
 * the track is `bg-surface-sunken` and the chosen item is `bg-card` lifted
 * with `shadow-xs`, which is the one pairing where the sunken surface is
 * correct — a recessed rail under a raised pill. Elsewhere in the app an
 * unfilled track on that token reads as a hole, because sunken sits below the
 * card in the dark schemes.
 *
 * In `icon` variant nothing is written down, so the selection has to be drawn:
 * the swatch keeps its ring and an inked check sits in the corner of its own
 * cell. It stays inside the cell because the track scrolls horizontally on
 * narrow screens, and `overflow-x: auto` turns `overflow-y: visible` into
 * `auto` — a badge that hung outside would be clipped rather than noticed.
 */
export default function PillGroup<T extends string>({
    label,
    id,
    value,
    options,
    onChange,
    variant = "labeled",
    className,
}: PillGroupProps<T>) {
    const isIcon = variant === "icon";

    return (
        <div
            role="group"
            id={id}
            aria-label={label}
            className={cn(
                "flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-full border bg-surface-sunken p-1",
                !isIcon && "sm:justify-end",
                className
            )}
        >
            {options.map((option) => {
                const selected = option.id === value;

                return (
                    <button
                        key={option.id}
                        type="button"
                        aria-pressed={selected}
                        title={option.label}
                        aria-label={isIcon ? option.label : undefined}
                        onClick={() => onChange(option.id)}
                        className={cn(
                            "outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                            selected
                                ? "bg-card text-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground",
                            isIcon
                                ? "relative flex size-7 shrink-0 items-center justify-center rounded-full"
                                : "flex h-8 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 text-sm font-medium"
                        )}
                    >
                        {option.preview}

                        {isIcon && selected ? (
                            <span
                                aria-hidden="true"
                                className="
                                    absolute right-0 bottom-0 flex size-3
                                    items-center justify-center rounded-full
                                    bg-foreground text-background
                                "
                            >
                                <Check
                                    className="size-[7px]"
                                    strokeWidth={3.5}
                                />
                            </span>
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
}
