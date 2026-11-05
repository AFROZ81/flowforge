import { Users } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { formatNumber } from "@/lib/format";
import { usePresence } from "@/features/presence";
import DataSection from "@/components/ui/data-section";
import EmptyStatePanel from "./EmptyStatePanel";
import SegmentBar from "@/components/ui/segment-bar";

import type { WorkloadMember } from "../types/dashboard.types";

/**
 * Who is carrying what.
 *
 * A list rather than a table, because this lives in the dashboard's right rail
 * and six numeric columns cannot fit in 380px without panning. The shape also
 * reads better: one segmented bar per person against the busiest, with the two
 * numbers that are not in the bar underneath it, instead of six right-aligned
 * columns nobody compares across rows.
 *
 * Bars are scaled to `assigned`, which is every item the person owns including
 * the finished ones, so the bar's right edge and the number beside the name
 * describe the same quantity.
 *
 * The bar carries both proportions that matter here: its length is the person's
 * load against the busiest member, its segments are what that load is made of.
 * Two people can be equally loaded and one of them stuck.
 *
 * Presence comes from the live SignalR feed rather than the snapshot, so a dot
 * here means online at this second - the numbers beside it are as of the
 * snapshot timestamp in the header, and the two are deliberately different.
 */
export default function TeamWorkload({
    members,
}: {
    members: WorkloadMember[];
}) {
    const { onlineUserIds } = usePresence();

    const totals = members.reduce(
        (accumulator, member) => ({
            assigned: accumulator.assigned + member.assigned,
            overdue: accumulator.overdue + member.overdue,
            blocked: accumulator.blocked + member.blocked,
        }),
        { assigned: 0, overdue: 0, blocked: 0 }
    );

    const onlineCount = members.filter((member) =>
        onlineUserIds.includes(member.userId)
    ).length;

    /* The bar compares each person with the busiest, which is the only
       comparison that means anything for a load column. */
    const busiest = Math.max(1, ...members.map((member) => member.assigned));

    return (
        <DataSection
            title="Team workload"
            icon={Users}
            note={`${formatNumber(onlineCount)} of ${formatNumber(
                members.length
            )} online · bars against the busiest`}
        >
            {members.length === 0 ? (
                <EmptyStatePanel
                    icon={Users}
                    title="Nobody has work assigned"
                    description="Assignees appear here once work items have an owner."
                />
            ) : (
                <>
                    {/* The same three states the project and status cards use,
                        keyed here as well: a bar a reader has to remember a
                        key from another card for is a bar they will not read. */}
                    <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1.5 border-b px-4 py-2.5 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <span
                                aria-hidden="true"
                                className="size-2 shrink-0 rounded-full bg-success"
                            />
                            Completed
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span
                                aria-hidden="true"
                                className="size-2 shrink-0 rounded-full bg-primary"
                            />
                            Active
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span
                                aria-hidden="true"
                                className="size-2 shrink-0 rounded-full bg-destructive"
                            />
                            Blocked
                        </span>
                    </div>

                    {/* Scrolls between the legend and the summary, the same way
                        the portfolio card beside it does, so the two agree about
                        what stays put and what moves. */}
                    <ul className="max-h-[26rem] min-h-[12rem] flex-1 divide-y divide-border overflow-y-auto xl:max-h-none">
                        {members.map((member) => {
                            const online = onlineUserIds.includes(
                                member.userId
                            );

                            return (
                                <li
                                    key={member.userId}
                                    className="flex items-start gap-3 px-4 py-3"
                                >
                                    <Avatar
                                        name={member.fullName}
                                        size="sm"
                                        ring
                                        indicator={
                                            online ? (
                                                <span
                                                    title="Online"
                                                    className="size-2 rounded-full bg-success ring-2 ring-card"
                                                >
                                                    <span className="sr-only">
                                                        Online
                                                    </span>
                                                </span>
                                            ) : undefined
                                        }
                                    />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline justify-between gap-3">
                                            <span className="truncate text-sm font-medium">
                                                {member.fullName}
                                            </span>
                                            <span className="shrink-0 text-sm leading-none font-semibold tabular-nums">
                                                {formatNumber(member.assigned)}
                                            </span>
                                        </div>

                                        <SegmentBar
                                            className="mt-2"
                                            total={busiest}
                                            segments={[
                                                {
                                                    label: "Completed",
                                                    value: member.completed,
                                                    className: "bg-success",
                                                },
                                                {
                                                    label: "Active",
                                                    value: member.active,
                                                    className: "bg-primary",
                                                },
                                                {
                                                    label: "Blocked",
                                                    value: member.blocked,
                                                    className: "bg-destructive",
                                                },
                                            ]}
                                        />

                                        {/* Only the two figures the bar cannot
                                            tell: blocked is a segment, but a red
                                            sliver is not a number you can act
                                            on, and being past due is a date
                                            property that cuts across every
                                            segment rather than a state of its
                                            own. */}
                                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] tabular-nums text-muted-foreground">
                                            {member.blocked > 0 ? (
                                                <span className="font-medium text-destructive">
                                                    {formatNumber(
                                                        member.blocked
                                                    )}{" "}
                                                    blocked
                                                </span>
                                            ) : null}

                                            {member.overdue > 0 ? (
                                                <span className="font-medium text-destructive">
                                                    {formatNumber(
                                                        member.overdue
                                                    )}{" "}
                                                    past due
                                                </span>
                                            ) : null}

                                            {member.blocked === 0 &&
                                            member.overdue === 0 ? (
                                                <span>
                                                    nothing blocked or past due
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="
                        flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t
                        bg-surface-muted/60 px-4 py-2.5 text-xs tabular-nums text-muted-foreground
                    ">
                        <span className="font-medium text-foreground">
                            All members
                        </span>
                        <span>
                            {formatNumber(totals.assigned)} assigned
                        </span>
                        {totals.blocked > 0 ? (
                            <span className="text-destructive">
                                {formatNumber(totals.blocked)} blocked
                            </span>
                        ) : null}
                        {totals.overdue > 0 ? (
                            <span className="text-destructive">
                                {formatNumber(totals.overdue)} past due
                            </span>
                        ) : null}
                    </div>
                </>
            )}
        </DataSection>
    );
}
