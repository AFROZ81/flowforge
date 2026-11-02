import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Color = "indigo" | "emerald" | "amber" | "purple";

type Props = {
    title: string;
    value: number | string;
    subtitle: string;
    icon: LucideIcon;
    color: Color;
    className?: ComponentProps<"div">["className"];
};

/*
 * Tones stay shallow and reuse the status tokens, so four tiles side by
 * side read as one measurement rather than four separate decorations.
 */
const colors: Record<Color, string> = {
    indigo: "bg-primary-subtle text-primary",
    emerald: "bg-success-subtle text-success-foreground",
    amber: "bg-warning-subtle text-warning-foreground",
    purple: "bg-brand-indigo-subtle text-brand-indigo",
};

/**
 * A single measured number and its context.
 *
 * Deliberately not focusable: it was previously wrapped in a `tabIndex={0}`
 * div whose key handler called preventDefault and then did nothing, which
 * trapped keyboard users on a dead control.
 */
export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    className,
}: Props) {
    return (
        <Card
            className={cn(
                "group/stat relative h-full gap-0 overflow-hidden rounded-xl shadow-xs",
                "transition-[transform,box-shadow,border-color] duration-(--transition-normal) ease-(--ease-standard)",
                "hover:border-border-strong hover:shadow-sm",
                className
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                        {title}
                    </p>

                    <p className="mt-2.5 font-heading text-[26px] leading-none font-bold tracking-[-0.03em] tabular-nums text-foreground sm:text-3xl">
                        {value}
                    </p>

                    <p className="mt-2 truncate text-xs text-muted-foreground">
                        {subtitle}
                    </p>
                </div>

                <span
                    aria-hidden="true"
                    className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10",
                        colors[color]
                    )}
                >
                    <Icon className="size-[18px]" strokeWidth={1.9} />
                </span>
            </div>

            {/* Hairline lift on hover keeps the tile from reading as a flat box */}
            <span
                aria-hidden="true"
                className={cn(
                    "pointer-events-none absolute inset-x-4 bottom-0 h-px rounded-full bg-primary/25",
                    "opacity-0 transition-opacity duration-(--transition-normal) group-hover/stat:opacity-100"
                )}
            />
        </Card>
    );
}
