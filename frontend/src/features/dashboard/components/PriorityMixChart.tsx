import { useState } from "react";
import { ChartPie } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatNumber, formatPercentage } from "@/lib/format";
import DataSection from "@/components/ui/data-section";
import EmptyStatePanel from "./EmptyStatePanel";

import type { PriorityMix } from "../types/dashboard.types";

/**
 * Low uses a calm success tone instead of neutral silver; the remaining hues
 * match the priority badges used elsewhere in the app.
 */
const SLICES = [
    { key: "low", label: "Low", color: "var(--success)" },
    { key: "medium", label: "Medium", color: "var(--info)" },
    { key: "high", label: "High", color: "var(--warning)" },
    { key: "critical", label: "Critical", color: "var(--danger)" },
] as const;

type Arc = {
    key: string;
    label: string;
    color: string;
    value: number;
    /** Percentage of the ring, in the same units as `pathLength`. */
    share: number;
    /** Where the slice begins, measured clockwise from twelve o'clock. */
    start: number;
};

const CENTRE = 20;
const RADIUS = 16;
const RING = 3.8;

/** Where the next slice begins: the end of the last one, or twelve o'clock. */
function previousEnd(laid: Array<Arc>): number {
    const last = laid[laid.length - 1];

    return last ? last.start + last.share : 0;
}

/**
 * How urgent the unfinished work is, as a ring.
 *
 * The one chart on this page that is a pie, and it earns it: four priority
 * bands is enough categories for angles to carry meaning, where the three-state
 * status mix below it is not (that one stays a stacked bar for exactly that
 * reason). Shares are what a ring encodes well - "a fifth of the queue is
 * critical" - and every absolute count stays printed in the legend beside it,
 * so nothing depends on judging an angle.
 *
 * Drawn as dashed strokes on one circle rather than arc paths: `pathLength={100}`
 * makes every dash measurement a percentage of the circumference, so the maths
 * is `share` and `start` instead of sine, cosine and the large-arc flag. The box
 * is square and scaled uniformly, which is why this SVG has none of the traps a
 * stretched one brings - no `non-scaling-stroke`, no overlay to keep text from
 * distorting.
 *
 * Hover is answered by the pointer's *angle* around the centre rather than by
 * hit-testing the strokes, because the exact anti-aliased boundary between two
 * slices is not something to build an interaction on.
 */
export default function PriorityMixChart({ mix }: { mix: PriorityMix }) {
    const [index, setIndex] = useState<number | null>(null);

    const arcs = SLICES.map((slice) => ({
        ...slice,
        value: mix[slice.key],
    })).filter((slice) => slice.value > 0);

    /* Shares come from the sum of the slices rather than from `total`, so the
       ring always closes however the server chose to count. */
    const sum = arcs.reduce((accumulator, arc) => accumulator + arc.value, 0);

    if (arcs.length === 0) {
        return (
            <DataSection
                className="flex-1"
                title="Priority mix"
                icon={ChartPie}
                note="Open work, by how urgent it is"
            >
                <EmptyStatePanel
                    icon={ChartPie}
                    title="Nothing waiting"
                    description="Open work appears here as soon as anything is assigned a priority."
                />
            </DataSection>
        );
    }

    /* Built with a fold rather than a running variable: nothing in render
       should be reassigned - the compiler rule that says so is right, since a
       stray `let` here would carry its value into the next render. Each slice
       starts where the one before it ended. */
    const laid = arcs.reduce<Array<Arc>>(
        (accumulator, arc) =>
            accumulator.concat({
                ...arc,
                share: (arc.value / sum) * 100,
                start: previousEnd(accumulator),
            }),
        []
    );

    const active = index === null ? null : laid[index];

    /* With nothing picked, the middle of the ring states the whole. */
    const readout = active ?? { label: "Open items", value: sum };

    const moveTo = (next: number) =>
        setIndex(Math.min(laid.length - 1, Math.max(0, next)));

    const stepFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
        const box = event.currentTarget.getBoundingClientRect();

        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);

        /* Zero at twelve o'clock, increasing clockwise - the direction the arcs
           are drawn, so the sector under the pointer is the one that lights up. */
        const turn = (Math.atan2(dx, -dy) * 180) / Math.PI;
        const percent = (((turn % 360) + 360) % 360) / 3.6;

        const found = laid.findIndex(
            (arc) => percent < arc.start + arc.share
        );

        /* Rounding can leave a hair past the last arc's end; it belongs to the
           last arc, not to the first. */
        setIndex(found === -1 ? laid.length - 1 : found);
    };

    return (
        <DataSection
            className="flex-1"
            title="Priority mix"
            icon={ChartPie}
            note={`${formatNumber(sum)} items not finished yet`}
        >
            <div className="
                flex min-h-0 flex-1 flex-wrap items-center gap-x-3 gap-y-3 overflow-y-auto
                px-3 py-3
            ">
                <div
                    className="relative mx-auto size-28 shrink-0 cursor-pointer outline-none sm:mx-0"
                    tabIndex={0}
                    role="img"
                    aria-label={`Open work by priority: ${laid
                        .map(
                            (arc) =>
                                `${arc.label} ${formatNumber(
                                    arc.value
                                )}, ${formatPercentage(
                                    Math.round(arc.share)
                                )}`
                        )
                        .join(", ")}. Use the left and right arrow keys to step through slices.`}
                    aria-keyshortcuts="ArrowLeft ArrowRight Home End"
                    onPointerMove={stepFromPointer}
                    onPointerLeave={() => setIndex(null)}
                    onFocus={() => moveTo(index ?? 0)}
                    onBlur={() => setIndex(null)}
                    onKeyDown={(event) => {
                        if (event.key === "ArrowLeft") {
                            event.preventDefault();
                            moveTo((index ?? laid.length) - 1);
                        } else if (event.key === "ArrowRight") {
                            event.preventDefault();
                            moveTo((index ?? -1) + 1);
                        } else if (event.key === "Home") {
                            event.preventDefault();
                            moveTo(0);
                        } else if (event.key === "End") {
                            event.preventDefault();
                            moveTo(laid.length - 1);
                        } else if (event.key === "Escape") {
                            setIndex(null);
                        }
                    }}
                >
                    <span
                        aria-hidden="true"
                        className="absolute inset-2 rounded-full bg-foreground/[0.025] ring-1 ring-inset ring-foreground/[0.045]"
                    />

                    <svg viewBox="0 0 40 40" className="relative size-full">
                        <circle
                            cx={CENTRE}
                            cy={CENTRE}
                            r={RADIUS}
                            fill="none"
                            stroke="var(--foreground)"
                            strokeWidth={RING}
                            opacity={0.07}
                        />

                        {/* Colour, dash and offset go through `style`, not
                            presentation attributes: var() is not resolved in an
                            attribute, and strokeDashoffset is only meaningful
                            here as a number of pathLength units. */}
                        {laid.map((arc, i) => (
                            <circle
                                key={arc.key}
                                cx={CENTRE}
                                cy={CENTRE}
                                r={RADIUS}
                                fill="none"
                                strokeWidth={RING}
                                strokeLinecap="butt"
                                pathLength={100}
                                transform={`rotate(-90 ${CENTRE} ${CENTRE})`}
                                className="transition-opacity duration-200 ease-out"
                                style={{
                                    stroke: arc.color,
                                    strokeDasharray: `${arc.share} ${
                                        100 - arc.share
                                    }`,
                                    strokeDashoffset: `${-arc.start}`,
                                    opacity:
                                        index === null || index === i
                                            ? 1
                                            : 0.32,
                                }}
                            />
                        ))}
                    </svg>

                    {/* The centre is a readout, not a label inside the SVG: it
                        has to stay crisp and it has room nobody else wants. */}
                    <div
                        aria-live="polite"
                        className="pointer-events-none absolute inset-5 flex flex-col items-center justify-center px-1 text-center"
                    >
                        <span className="text-[8px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                            Priority
                        </span>
                        <span className="mt-0.5 text-lg leading-none font-semibold tracking-[-0.03em] tabular-nums">
                            {formatNumber(readout.value)}
                        </span>
                        <span className="mt-0.5 max-w-16 truncate text-[9px] leading-none text-muted-foreground">
                            {active
                                ? `${active.label} ${Math.round(active.share)}%`
                                : readout.label}
                        </span>
                    </div>
                </div>

                <ul className="min-w-0 flex-1 basis-36 space-y-0.5">
                    {laid.map((arc, i) => (
                        <li
                            key={arc.key}
                            onPointerEnter={() => setIndex(i)}
                            onPointerLeave={() => setIndex(null)}
                            className={cn(
                                "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border px-2 py-1 transition-colors",
                                index === i
                                    ? "border-border bg-foreground/[0.035]"
                                    : "border-transparent hover:bg-foreground/[0.025]"
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className="flex size-6 items-center justify-center rounded-md"
                                style={{
                                    background: `color-mix(in oklab, ${arc.color} 14%, transparent)`,
                                    color: arc.color,
                                }}
                            >
                                <span
                                    className="size-1.5 rounded-full"
                                    style={{ background: arc.color }}
                                />
                            </span>

                            <div className="min-w-0">
                                <div className="flex items-center justify-between gap-2 text-[10px]">
                                    <span className="truncate font-medium">
                                        {arc.label}
                                    </span>
                                    <span className="shrink-0 tabular-nums text-muted-foreground">
                                        {formatPercentage(
                                            Math.round(arc.share)
                                        )}
                                    </span>
                                </div>

                                <span className="mt-1 block h-0.5 overflow-hidden rounded-full bg-foreground/10">
                                    <span
                                        className="block h-full rounded-full transition-[width] duration-200 ease-out"
                                        style={{
                                            width: `${arc.share}%`,
                                            background: arc.color,
                                        }}
                                    />
                                </span>
                            </div>

                            <span className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums">
                                {formatNumber(arc.value)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </DataSection>
    );
}
