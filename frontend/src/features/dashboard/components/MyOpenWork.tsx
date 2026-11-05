import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Inbox, ListChecks } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import {
    DueDateChip,
    WorkItemPriorityBadge,
    WorkItemStatusBadge,
} from "@/components/common/indicators";
import DataSection from "@/components/ui/data-section";
import { EmptyState } from "@/components/ui/empty-state";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import type { WorkItemBrief } from "../types/dashboard.types";

type Filter = "all" | "overdue" | "soon" | "blocked";

const FILTERS: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "overdue", label: "Overdue" },
    { id: "soon", label: "Due in 7 days" },
    { id: "blocked", label: "Blocked" },
];

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * A severity stripe down the left of each row.
 *
 * The badge in the Priority column says the word; this says it fast enough to
 * scan a screenful of work without reading it, and is the only place on the
 * page where colour carries meaning before text does.
 */
const PRIORITY_RAIL: Record<string, string> = {
    Critical: "bg-destructive",
    High: "bg-warning",
    Medium: "bg-info",
    Low: "bg-border-strong",
};

function matches(item: WorkItemBrief, filter: Filter): boolean {
    const due = item.dueDate ? new Date(item.dueDate).getTime() : null;
    const now = Date.now();

    switch (filter) {
        case "overdue":
            return due !== null && due < now;
        case "soon":
            return due !== null && due >= now && due <= now + WEEK_MS;
        case "blocked":
            return item.status === "Blocked";
        default:
            return true;
    }
}

/* Pinned inside the scroll window rather than against the page. The divider is
   an inset shadow because the table is border-collapse, and a collapsed border
   does not paint on a stuck cell. */
const HEAD_CELL =
    "sticky top-0 z-10 bg-card shadow-[inset_0_-1px_0_var(--border)]";

/**
 * The list behind the figures above it.
 *
 * The pane scrolls inside a bounded card. An unbounded list is the one thing
 * that breaks a two-column dashboard: this card is the only section whose row
 * count is somebody's workload, so on a busy account it grew past every other
 * card and left the whole right rail standing in empty background.
 *
 * From xl the row the page puts it in has a definite height, so the pane fills
 * that and the ceiling is lifted; below the breakpoint the page is one column
 * with no row to match, and `max-h` is what keeps a long queue from turning into
 * a very tall card on a phone. `min-h` is not decoration: a flex item with a
 * zero basis and no floor collapses to nothing inside an auto-height card, which
 * would leave the table laid out over a pane of no height at all.
 *
 * The note counts against the true total, not the loaded window - the snapshot
 * returns at most a hundred rows while the figures above it are computed over
 * everything assigned, so "100 of 143" is the honest form of both.
 */
export default function MyOpenWork({
    items,
    total,
}: {
    items: WorkItemBrief[];
    /** All open items assigned to the signed-in user. */
    total: number;
}) {
    const [filter, setFilter] = useState<Filter>("all");

    const rows = useMemo(
        () => items.filter((item) => matches(item, filter)),
        [items, filter]
    );

    return (
        <DataSection
            title="My open work"
            icon={ListChecks}
            note={`${formatNumber(rows.length)} of ${formatNumber(total)} assigned items`}
        >
            {/*
             * Its own toolbar row rather than a control beside the heading: the
             * heading's action slot cannot shrink, so four chips would run past a
             * narrow screen and be cut off by the layout's overflow-x-hidden.
             *
             * Hidden entirely when there is no work at all - offering to filter
             * an empty list is noise, and it was the chips that made the empty
             * card look like a broken table rather than an empty one.
             */}
            {items.length > 0 ? (
                <div
                    role="group"
                    aria-label="Filter my open work"
                    className="
                        flex items-center gap-1 overflow-x-auto border-b px-4 py-2 shrink-0
                    "
                >
                    {FILTERS.map((option) => {
                        const selected = option.id === filter;

                        return (
                            <button
                                key={option.id}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => setFilter(option.id)}
                                className={cn(
                                    "h-7 shrink-0 rounded-full border px-3 text-xs font-medium whitespace-nowrap",
                                    "outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                                    selected
                                        ? "border-primary bg-primary-subtle text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            ) : null}

            {rows.length === 0 ? (
                <EmptyState
                    icon={Inbox}
                    size="sm"
                    title={
                        items.length === 0
                            ? "Nothing assigned to you"
                            : "No items match this filter"
                    }
                    description={
                        items.length === 0
                            ? "Work items appear here as soon as somebody assigns them to you."
                            : "Try a different filter to see the rest of your open work."
                    }
                    className="py-6"
                />
            ) : (
                /* Fixed layout with stated proportions. An auto layout grows
                   the table to the natural width of the longest title, which
                   pushed the Due column clean out of a 745px card and left the
                   table scrolling inside its own border - truncation only
                   bites when the column already has a width to truncate to.

                   Four columns, not five: the project had its own, which left
                   the title a third of the card and truncated nine rows out of
                   ten. The project key now rides in the subline beside the
                   board, which is where a reader already looks for it, and the
                   title gets half the width. */
                <Table
                    className="w-full min-w-[38rem] table-fixed"
                    containerClassName="
                        max-h-[26rem] min-h-[16rem] flex-1 overflow-x-auto overflow-y-auto
                        xl:max-h-none
                    "
                >
                    <TableHeader>
                        <TableRow>
                            <TableHead className={cn("w-[50%]", HEAD_CELL)}>
                                Work item
                            </TableHead>
                            <TableHead className={cn("w-[18%]", HEAD_CELL)}>
                                Status
                            </TableHead>
                            <TableHead className={cn("w-[16%]", HEAD_CELL)}>
                                Priority
                            </TableHead>
                            <TableHead
                                className={cn("w-[16%] text-right", HEAD_CELL)}
                            >
                                Due
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="relative py-3 pr-3 pl-5">
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            "absolute top-2.5 bottom-2.5 left-1.5 w-[3px] rounded-full",
                                            PRIORITY_RAIL[item.priority] ??
                                                "bg-border"
                                        )}
                                    />
                                    <Link
                                        to={`/projects/${item.projectId}/boards/${item.boardId}`}
                                        title={item.title}
                                        className="
                                            group block min-w-0 rounded-sm
                                            outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40
                                        "
                                    >
                                        <span className="block truncate font-medium group-hover:underline">
                                            {item.title}
                                        </span>
                                        <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                                            <span className="shrink-0 rounded bg-surface-sunken px-1 py-px font-mono text-[10px] font-semibold tracking-[0.04em] uppercase tabular-nums">
                                                {item.projectKey}
                                            </span>
                                            <span className="truncate">
                                                {item.boardName}
                                            </span>
                                        </span>
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <WorkItemStatusBadge status={item.status} />
                                </TableCell>
                                <TableCell>
                                    {/* Full label, not the compact form: the table
                                        pans rather than squeezes, so the word fits. */}
                                    <WorkItemPriorityBadge
                                        priority={item.priority}
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.dueDate ? (
                                        <DueDateChip
                                            dueDate={item.dueDate}
                                            prefix={null}
                                            className="justify-end"
                                        />
                                    ) : (
                                        <span className="text-xs text-muted-foreground/60">
                                            No due date
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </DataSection>
    );
}
