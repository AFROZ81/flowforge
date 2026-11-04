import { useState } from "react";
import { Activity } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import DataSection from "@/components/ui/data-section";
import EmptyStatePanel from "./EmptyStatePanel";

import type { TrendPoint } from "../types/dashboard.types";

const SERIES = [
    { key: "created" as const, label: "Created", color: "var(--chart-3)" },
    { key: "completed" as const, label: "Completed", color: "var(--chart-1)" },
];

/**
 * Work created against work completed, one pair of columns per day.
 *
 * Columns rather than an area chart, and drawn with divs rather than SVG. An
 * area needs a stretched viewBox, which is what forced `non-scaling-stroke`
 * and a set of absolutely positioned overlays for the crosshair; fourteen days
 * of counts are two integers per day, and a bar chart is both the honest
 * encoding and the one that survives a narrow screen without distortion.
 *
 * The scale is built from whole numbers. Rounding a half-step produced an axis
 * reading "1, 1, 0" on a small workspace, which looks like a data error rather
 * than a small number, so the step is chosen first and the top of the scale is
 * four steps above it.
 *
 * The plot has no fixed height: it fills whatever the card is given. This is
 * the dashboard's only element that gains from being taller, so the card is
 * the one that stretches to meet the column beside it instead of leaving a
 * gap under it.
 */
export default function ThroughputChart({ points }: { points: TrendPoint[] }) {
    const [index, setIndex] = useState<number | null>(null);

    if (points.length === 0) {
        return (
            <DataSection
                title="Throughput"
                icon={Activity}
                note="Work created against work completed"
            >
                <EmptyStatePanel
                    icon={Activity}
                    title="No activity to plot"
                    description="Created and completed counts appear here as work moves."
                />
            </DataSection>
        );
    }

    const totals = points.reduce(
        (accumulator, point) => ({
            created: accumulator.created + point.created,
            completed: accumulator.completed + point.completed,
        }),
        { created: 0, completed: 0 }
    );

    const peak = Math.max(
        1,
        ...points.flatMap((point) => [point.created, point.completed])
    );

    const step = Math.max(1, Math.ceil(peak / 4));
    const top = step * 4;

    /* Ascending, so the gridlines can be placed by value and the axis labels
       simply read it back in reverse. */
    const ticks = [0, step, step * 2, step * 3, step * 4];

    const height = (value: number) => `${(value / top) * 100}%`;

    const hovered = index === null ? null : points[index];

    const readout = hovered ?? {
        date: null as string | null,
        created: totals.created,
        completed: totals.completed,
    };

    const moveTo = (next: number) =>
        setIndex(Math.min(points.length - 1, Math.max(0, next)));

    return (
        <DataSection
            className="flex-1"
            title="Throughput"
            icon={Activity}
            note={`Last ${formatNumber(points.length)} days, ${formatNumber(
                totals.created
            )} created · ${formatNumber(totals.completed)} completed`}
        >
            <div className="flex min-h-0 flex-1 flex-col px-4 pt-4 pb-3">
                {/* The readout sits above the plot rather than floating as a
                    tooltip: it cannot be pushed off-screen, and it survives a
                    narrow phone. */}
                <div
                    aria-live="polite"
                    className="mb-3 flex shrink-0 flex-wrap items-baseline gap-x-4 gap-y-1"
                >
                    <span className="text-xs text-muted-foreground">
                        {readout.date
                            ? dayLabel(readout.date)
                            : `Totals over ${points.length} days`}
                    </span>

                    {SERIES.map((item) => (
                        <span
                            key={item.key}
                            className="flex items-baseline gap-1.5 text-xs"
                        >
                            <span
                                aria-hidden="true"
                                className="size-2 shrink-0 self-center rounded-full"
                                style={{ background: item.color }}
                            />
                            <span className="text-muted-foreground">
                                {item.label}
                            </span>
                            <span className="font-semibold tabular-nums text-foreground">
                                {formatNumber(readout[item.key])}
                            </span>
                        </span>
                    ))}
                </div>

                {/* Three grid children, not two. The axis and the plot share
                    row one and the day labels own row two, so the tick column
                    is exactly as tall as the band. Nesting the labels inside
                    the plot instead collapsed row two to zero and let the axis
                    run sixteen pixels past the baseline, which reads as a
                    wrong scale. */}
                <div className="grid min-h-0 flex-1 grid-cols-[auto_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] gap-x-3">
                    <div
                        aria-hidden="true"
                        className="relative min-h-0 w-7 text-right text-[10px] leading-none tabular-nums text-muted-foreground"
                    >
                        {/* Each tick is placed at its own value and shifted
                            down by half its height, so its centre lands on the
                            gridline. Distributing the same labels with
                            justify-between aligned their edges instead, which
                            left the top tick 5px low and the bottom one 5px
                            high - a scale that points at the wrong lines. */}
                        {ticks.map((tick) => (
                            <span
                                key={tick}
                                className="absolute inset-x-0"
                                style={{
                                    bottom: height(tick),
                                    transform: "translateY(50%)",
                                }}
                            >
                                {formatNumber(tick)}
                            </span>
                        ))}
                    </div>

                    <div
                        className="relative min-h-40 outline-none"
                        tabIndex={0}
                        role="img"
                        aria-label={`Work created and completed over ${
                            points.length
                        } days. ${formatNumber(totals.created)} created, ${formatNumber(
                            totals.completed
                        )} completed. Use the left and right arrow keys to step through days.`}
                        aria-keyshortcuts="ArrowLeft ArrowRight Home End"
                        onFocus={() => moveTo(index ?? points.length - 1)}
                        onBlur={() => setIndex(null)}
                        onKeyDown={(event) => {
                            if (event.key === "ArrowLeft") {
                                event.preventDefault();
                                moveTo((index ?? points.length) - 1);
                            } else if (event.key === "ArrowRight") {
                                event.preventDefault();
                                moveTo((index ?? -1) + 1);
                            } else if (event.key === "Home") {
                                event.preventDefault();
                                moveTo(0);
                            } else if (event.key === "End") {
                                event.preventDefault();
                                moveTo(points.length - 1);
                            } else if (event.key === "Escape") {
                                setIndex(null);
                            }
                        }}
                        onPointerLeave={() => setIndex(null)}
                    >
                        {/* Gridlines behind the columns, confined to the band
                            so the day labels stay clear of them. */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0"
                        >
                            {ticks
                                .filter((tick) => tick > 0)
                                .map((tick) => (
                                    <span
                                        key={tick}
                                        className="absolute inset-x-0 border-t border-dashed border-border/70"
                                        style={{
                                            bottom: height(tick),
                                            transform: "translateY(50%)",
                                        }}
                                    />
                                ))}

                            <span className="absolute inset-x-0 bottom-0 border-t border-border" />
                        </div>

                        <div className="relative flex h-full gap-1">
                            {points.map((point, i) => (
                                <div
                                    key={point.date}
                                    className={cn(
                                        "flex min-w-0 flex-1 items-end justify-center gap-[3px] rounded-t-sm transition-colors",
                                        index === i
                                            ? "bg-foreground/5"
                                            : "bg-transparent"
                                    )}
                                    onPointerEnter={() => moveTo(i)}
                                >
                                    {SERIES.map((item) => (
                                        <span
                                            key={item.key}
                                            className="w-full max-w-[15px] rounded-t-[2px] transition-[height] duration-200 ease-out"
                                            style={{
                                                height: height(point[item.key]),
                                                minHeight:
                                                    point[item.key] > 0
                                                        ? "2px"
                                                        : "0",
                                                background: item.color,
                                                opacity:
                                                    index === null ||
                                                    index === i
                                                        ? 1
                                                        : 0.55,
                                            }}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Row two, in the same grid column as the band, so each
                        label sits under its own day without either row having
                        to know the other's widths. */}
                    <div
                        aria-hidden="true"
                        className="col-start-2 flex gap-1 pt-1.5"
                    >
                        {points.map((point, i) => (
                            <span
                                key={point.date}
                                className={cn(
                                    "min-w-0 flex-1 text-center text-[10px] leading-none tabular-nums",
                                    index === i
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                {dayNumber(point.date)}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </DataSection>
    );
}

/**
 * The server sends a plain calendar date, so it is parsed as UTC. Reading
 * "2026-11-04" with new Date() would shift it a day backwards for anybody west
 * of Greenwich.
 */
function parts(value: string) {
    const date = new Date(`${value}T00:00:00Z`);

    return Number.isNaN(date.getTime()) ? null : date;
}

function dayNumber(value: string): string {
    const date = parts(value);

    return date ? String(date.getUTCDate()) : value;
}

function dayLabel(value: string): string {
    const date = parts(value);

    return date
        ? date.toLocaleDateString(undefined, {
              weekday: "short",
              day: "numeric",
              month: "short",
              timeZone: "UTC",
          })
        : value;
}
