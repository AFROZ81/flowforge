import { Layers } from "lucide-react";

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
 * the rest of the row, because three rows of a legend know how tall they are.
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
            <div className="space-y-4 px-4 py-4">
                {mix.total === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No work items in this workspace yet.
                    </p>
                ) : (
                    <>
                        <SegmentBar segments={segments} />

                        <dl className="space-y-2">
                            {segments.map((segment) => (
                                <div
                                    key={segment.label}
                                    className="flex items-center justify-between gap-4"
                                >
                                    <dt className="flex min-w-0 items-center gap-2 text-sm text-foreground">
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                "size-2.5 shrink-0 rounded-full",
                                                segment.className
                                            )}
                                        />
                                        {segment.label}
                                    </dt>
                                    <dd className="flex shrink-0 items-center gap-3 text-sm tabular-nums">
                                        <span className="w-11 text-right text-muted-foreground">
                                            {formatPercentage(
                                                mix.total > 0
                                                    ? (segment.value /
                                                          mix.total) *
                                                          100
                                                    : 0
                                            )}
                                        </span>
                                        <span className="w-8 text-right font-medium">
                                            {formatNumber(segment.value)}
                                        </span>
                                    </dd>
                                </div>
                            ))}
                        </dl>

                        {mix.overdue > 0 ? (
                            <p className="border-t pt-3 text-xs text-muted-foreground">
                                <span className="font-medium text-destructive tabular-nums">
                                    {formatNumber(mix.overdue)}
                                </span>{" "}
                                of these are past their due date.
                            </p>
                        ) : null}
                    </>
                )}
            </div>
        </DataSection>
    );
}
