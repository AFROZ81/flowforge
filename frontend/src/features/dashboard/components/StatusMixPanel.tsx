import { Clock3, Layers } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatNumber, formatPercentage } from "@/lib/format";
import DataSection from "@/components/ui/data-section";
import SegmentBar from "@/components/ui/segment-bar";

import type { StatusMix } from "../types/dashboard.types";

/**
 * This is the workspace's whole stock of work - completed included - which is
 * why it is not the same three numbers as the priority ring beside it: that one
 * counts only what is still open.
 *
 * A stacked bar rather than a pie: three slices is too few for angles to carry
 * meaning, and a bar lets the eye compare them against the same baseline. The
 * ring two cards down is a ring because it has four bands to compare, not
 * because circles look like dashboards.
 *
 * Overdue is reported underneath instead of as a fourth segment, because it
 * cuts across the states rather than being one - a past-due item is also
 * active or blocked, and drawing it as a slice would count it twice.
 *
 * It keeps its own height in the stacked pair and lets the ring beside it take
 * the rest of the row, because the completion summary and three compact tiles
 * know how tall they are.
 */
export default function StatusMixPanel({ mix }: { mix: StatusMix }) {
    const segments = [
        {
            label: "Completed",
            value: mix.completed,
            className: "bg-success",
        },
        { label: "Active", value: mix.active, className: "bg-primary" },
        { label: "Blocked", value: mix.blocked, className: "bg-destructive" },
    ];

    const completionRate =
        mix.total > 0 ? (mix.completed / mix.total) * 100 : 0;

    return (
        <DataSection
            className="shrink-0"
            title="Status mix"
            icon={Layers}
            note={
                mix.total > 0
                    ? `${formatNumber(mix.total)} work items`
                    : undefined
            }
        >
            <div className="space-y-2.5 px-3 py-3">
                {mix.total === 0 ? (
                    <div className="py-1">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-foreground/5 text-muted-foreground">
                            <Layers className="size-3.5" strokeWidth={1.8} />
                        </span>
                        <p className="mt-2 text-sm font-medium text-foreground">
                            No work items yet
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            Status distribution will appear here as work is added.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-end justify-between gap-3">
                            <div>
                                <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                    Completion rate
                                </p>
                                <p className="mt-0.5 text-xl leading-none font-semibold tracking-[-0.03em] tabular-nums">
                                    {formatPercentage(completionRate)}
                                </p>
                            </div>

                            <span className="rounded-full border bg-foreground/[0.02] px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                                {formatNumber(mix.total)} total
                            </span>
                        </div>

                        <SegmentBar
                            segments={segments}
                            className="h-2 bg-foreground/[0.07]"
                        />

                        <dl className="grid grid-cols-3 gap-1.5">
                            {segments.map((segment) => {
                                const share =
                                    mix.total > 0
                                        ? (segment.value / mix.total) * 100
                                        : 0;

                                return (
                                    <div
                                        key={segment.label}
                                        className="min-w-0 rounded-lg border bg-foreground/[0.02] px-2 py-1.5"
                                    >
                                        <dt className="flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                                            <span
                                                aria-hidden="true"
                                                className={cn(
                                                    "size-1.5 shrink-0 rounded-full",
                                                    segment.className
                                                )}
                                            />
                                            <span className="truncate">
                                                {segment.label}
                                            </span>
                                        </dt>
                                        <dd className="mt-1 flex items-baseline justify-between gap-1">
                                            <span className="text-base leading-none font-semibold tabular-nums">
                                                {formatNumber(segment.value)}
                                            </span>
                                            <span className="text-[10px] tabular-nums text-muted-foreground">
                                                {formatPercentage(
                                                    Math.round(share)
                                                )}
                                            </span>
                                        </dd>
                                    </div>
                                );
                            })}
                        </dl>

                        {mix.overdue > 0 ? (
                            <div className="flex items-center justify-between gap-3 rounded-lg bg-destructive-subtle px-2.5 py-1.5 text-[10px] text-danger-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Clock3
                                        className="size-3"
                                        strokeWidth={1.9}
                                    />
                                    Past due
                                </span>
                                <span className="font-semibold tabular-nums">
                                    {formatNumber(mix.overdue)} items
                                </span>
                            </div>
                        ) : null}
                    </>
                )}
            </div>
        </DataSection>
    );
}
