import { useState } from "react";
import { ChartPie } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatNumber, formatPercentage } from "@/lib/format";
import DataSection from "@/components/ui/data-section";
import EmptyStatePanel from "./EmptyStatePanel";

import type { PriorityMix } from "../types/dashboard.types";

/**
 * The four hues the priority flags and badges already use, so a Medium item is
 * the same blue on the board as it is here.
 */
const SLICES = [
    { key: "low", label: "Low", color: "var(--muted-foreground)" },
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
const RING = 5.5;

/* Space between slices, in percentage-of-circle units. It is only paid for when
   there is more than one slice: a lone full ring wearing a notch reads as a
   rendering defect, not as a chart. */
const GAP = 0.9;

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
 * hit-testing the strokes, because whether a browser treats the gap half of a
 * dash pattern as unpainted is not something to build an interaction on.
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

    const gap = arcs.length > 1 ? GAP : 0;

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
    const readout = active ?? { label: "open", value: sum };

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
                flex min-h-[9rem] flex-1 flex-wrap items-center gap-x-6 gap-y-4 overflow-y-auto
                px-4 py-4
            ">
                <div
                    className="relative mx-auto size-[132px] shrink-0 cursor-pointer outline-none sm:mx-0"
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
                    <svg viewBox="0 0 40 40" className="size-full">
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
                                pathLength={100}
                                transform={`rotate(-90 ${CENTRE} ${CENTRE})`}
                                style={{
                                    stroke: arc.color,
                                    strokeDasharray: `${arc.share - gap} ${
                                        100 - (arc.share - gap)
                                    }`,
                                    strokeDashoffset: `${-(arc.start + gap / 2)}`,
                                    opacity:
                                        index === null || index === i
                                            ? 1
                                            : 0.35,
                                }}
                            />
                        ))}
                    </svg>

                    {/* The centre is a readout, not a label inside the SVG: it
                        has to stay crisp and it has room nobody else wants. */}
                    <div
                        aria-live="polite"
                        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
                    >
                        <span className="text-xl leading-none font-semibold tabular-nums">
                            {formatNumber(readout.value)}
                        </span>
                        <span className="mt-1 max-w-[70%] truncate text-[11px] leading-none text-muted-foreground">
                            {readout.label}
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
                                "flex items-center gap-2 rounded-md px-1.5 py-1 text-sm transition-colors",
                                index === i
                                    ? "bg-foreground/5"
                                    : "bg-transparent"
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className="size-2.5 shrink-0 rounded-full"
                                style={{ background: arc.color }}
                            />
                            <span className="min-w-0 flex-1 truncate">
                                {arc.label}
                            </span>
                            <span className="shrink-0 tabular-nums text-muted-foreground">
                                {/* Whole percents only. The exact count is two
                                    columns away, so a decimal here would imply
                                    the angle was measured to a tenth. */}
                                {formatPercentage(Math.round(arc.share))}
                            </span>
                            <span className="w-8 shrink-0 text-right font-medium tabular-nums">
                                {formatNumber(arc.value)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </DataSection>
    );
}
