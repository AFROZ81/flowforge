import { Layers } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatNumber, formatPercentage } from "@/lib/format";
import DataSection from "@/components/ui/data-section";

import type { StatusMix } from "../types/dashboard.types";

/**
 * How workspace work is distributed across its three states.
 *
 * A stacked bar rather than a pie: three slices is already too few for angles
 * to carry meaning, and a bar lets the eye compare them against the same
 * baseline. Overdue is reported underneath instead of as a fourth segment,
 * because it cuts across the states rather than being one.
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
                        {/* Gaps between the segments let the track show through,
                            so a zero-count state is visible as an absent segment
                            rather than as a bar of one colour. */}
                        <div className="flex h-3.5 w-full gap-1 rounded-full bg-foreground/10 p-0.5">
                            {segments.map((segment) => (
                                <span
                                    key={segment.label}
                                    title={`${segment.label}: ${formatNumber(segment.value)}`}
                                    className={cn(
                                        "min-w-0 rounded-full transition-[flex-grow] duration-200 ease-out",
                                        segment.className
                                    )}
                                    style={{ flexGrow: segment.value }}
                                />
                            ))}
                        </div>

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
