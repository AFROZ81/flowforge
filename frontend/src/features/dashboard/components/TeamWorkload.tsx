import { Users } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { formatNumber } from "@/lib/format";
import { usePresence } from "@/features/presence";
import DataSection from "@/components/ui/data-section";
import EmptyStatePanel from "./EmptyStatePanel";
import Meter from "@/components/ui/meter";

import type { WorkloadMember } from "../types/dashboard.types";

/**
 * Who is carrying what.
 *
 * A list rather than a table, because this lives in the dashboard's right rail
 * and six numeric columns cannot fit in 380px without panning. The shape also
 * reads better: one bar per person against the busiest, with the secondary
 * counts as a sentence underneath instead of six right-aligned numbers nobody
 * compares across rows.
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
                    <ul className="divide-y divide-border">
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

                                        <Meter
                                            value={member.assigned}
                                            total={busiest}
                                            showValue={false}
                                            className="mt-2 w-full min-w-0"
                                        />

                                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] tabular-nums text-muted-foreground">
                                            <span>
                                                {formatNumber(member.active)}{" "}
                                                active
                                            </span>
                                            <span>
                                                {formatNumber(member.completed)}{" "}
                                                done
                                            </span>

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
                                                    overdue
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t bg-surface-muted/60 px-4 py-2.5 text-xs tabular-nums text-muted-foreground">
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
                                {formatNumber(totals.overdue)} overdue
                            </span>
                        ) : null}
                    </div>
                </>
            )}
        </DataSection>
    );
}
