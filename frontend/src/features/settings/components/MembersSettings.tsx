import { useMemo, useState } from "react";
import {
    ArrowDown,
    ArrowUp,
    CircleAlert,
    RefreshCw,
    Search,
    UsersRound,
    X,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyStateCard } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { usePresence } from "@/features/presence";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

import { useMemberWorkload, type AssigneeSummary } from "../hooks/useMemberWorkload";
import { useWorkspaceMembers } from "../hooks/useWorkspaceMembers";

type SortKey =
    | "name"
    | "assigned"
    | "active"
    | "completed"
    | "blocked"
    | "overdue";

type SortDirection = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string; numeric: boolean }[] = [
    { key: "name", label: "Member", numeric: false },
    { key: "assigned", label: "Assigned", numeric: true },
    { key: "active", label: "Active", numeric: true },
    { key: "completed", label: "Completed", numeric: true },
    { key: "blocked", label: "Blocked", numeric: true },
    { key: "overdue", label: "Overdue", numeric: true },
];

/* -------------------------------------------------------------------------- */
/* Panel                                                                      */
/* -------------------------------------------------------------------------- */

export default function MembersSettings() {
    const members = useWorkspaceMembers();
    const workload = useMemberWorkload();
    const { onlineUserIds } = usePresence();
    const selfId = useAuthStore((state) => state.user?.id);

    const [search, setSearch] = useState("");
    const [onlineOnly, setOnlineOnly] = useState(false);
    const [sort, setSort] = useState<{ key: SortKey; dir: SortDirection }>({
        key: "name",
        dir: "asc",
    });

    const workloadByUserId = useMemo(() => {
        const map = new Map<string, AssigneeSummary>();

        for (const entry of workload.data ?? []) {
            map.set(entry.userId, entry);
        }

        return map;
    }, [workload.data]);

    const rows = useMemo(() => {
        const query = search.trim().toLowerCase();

        return (members.data ?? [])
            .map((member) => ({
                ...member,
                online: onlineUserIds.includes(member.id),
                isSelf: member.id === selfId,
                work: workloadByUserId.get(member.id) ?? null,
            }))
            .filter((member) => (onlineOnly ? member.online : true))
            .filter((member) => {
                if (!query) {
                    return true;
                }

                return (
                    member.fullName.toLowerCase().includes(query) ||
                    (member.email ?? "").toLowerCase().includes(query)
                );
            })
            .sort((left, right) => {
                const direction = sort.dir === "asc" ? 1 : -1;

                if (sort.key === "name") {
                    return (
                        direction *
                        left.fullName.localeCompare(right.fullName, undefined, {
                            sensitivity: "base",
                        })
                    );
                }

                /*
                 * A member with no assignments has no number to rank, not a zero:
                 * -1 keeps them at the bottom whichever way the column is sorted.
                 */
                const leftValue = left.work?.[sort.key] ?? -1;
                const rightValue = right.work?.[sort.key] ?? -1;

                return direction * (leftValue - rightValue);
            });
    }, [members.data, workloadByUserId, onlineUserIds, selfId, search, onlineOnly, sort]);

    const totals = rows.reduce(
        (accumulator, row) => ({
            assigned: accumulator.assigned + (row.work?.assigned ?? 0),
            active: accumulator.active + (row.work?.active ?? 0),
            completed: accumulator.completed + (row.work?.completed ?? 0),
            blocked: accumulator.blocked + (row.work?.blocked ?? 0),
            overdue: accumulator.overdue + (row.work?.overdue ?? 0),
        }),
        { assigned: 0, active: 0, completed: 0, blocked: 0, overdue: 0 }
    );

    const onlineCount = (members.data ?? []).filter((member) =>
        onlineUserIds.includes(member.id)
    ).length;

    /*
     * The two queries fail differently. Without the roster there is nothing to
     * show, so that is an error state; the workload only fills four columns, so
     * losing it should not hide the people who are here.
     */
    const workloadFailed = Boolean(workload.error);

    const toggleSort = (key: SortKey, numeric: boolean) => {
        setSort((current) =>
            current.key === key
                ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
                : // First click on a count asks "who has the most?"; names start A–Z.
                  { key, dir: numeric ? "desc" : "asc" }
        );
    };

    if (members.isPending) {
        return <LoadingTable />;
    }

    if (members.error) {
        return (
            <div
                role="alert"
                className="flex flex-wrap items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
                <CircleAlert className="size-4 shrink-0" />
                <span className="min-w-0 flex-1">
                    The roster could not be loaded. Please try again.
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        void members.refetch();
                        void workload.refetch();
                    }}
                >
                    <RefreshCw />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <p className="text-xs tabular-nums text-muted-foreground">
                    {formatNumber(members.data?.length ?? 0)} members
                    {"  ·  "}
                    {formatNumber(onlineCount)} online
                    {"  ·  "}
                    showing {formatNumber(rows.length)} of{" "}
                    {formatNumber(members.data?.length ?? 0)}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        aria-pressed={onlineOnly}
                        onClick={() => setOnlineOnly((current) => !current)}
                        className={cn(
                            "flex h-8 items-center gap-2 rounded-full border px-3 text-sm font-medium",
                            "outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                            onlineOnly
                                ? "border-primary bg-primary-subtle text-primary"
                                : "border-input bg-card text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className={cn(
                                "size-2 rounded-full",
                                onlineOnly ? "bg-success" : "bg-border-strong"
                            )}
                        />
                        Online only
                    </button>

                    <div className="relative min-w-0 flex-1 sm:flex-none">
                        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Filter members"
                            aria-label="Filter members"
                            className="h-8 w-full pl-8 pr-8 sm:w-64"
                        />
                        {search ? (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                aria-label="Clear filter"
                                className="absolute top-1/2 right-2 grid size-5 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <X className="size-3.5" />
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>

            {workloadFailed ? (
                <div
                    role="alert"
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                >
                    <CircleAlert className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1">
                        Workload figures could not be loaded. The roster below is
                        still current.
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void workload.refetch()}
                    >
                        Retry
                    </Button>
                </div>
            ) : null}

            {rows.length === 0 ? (
                <EmptyStateCard
                    icon={UsersRound}
                    size="sm"
                    title="No matching members"
                    description={
                        search || onlineOnly
                            ? "No member matches the current filter."
                            : "This workspace has no other people in it yet."
                    }
                />
            ) : (
                <div className="overflow-hidden rounded-xl border bg-card">
                    {/*
                     * A floor width is what makes the card pan on a phone: `w-full`
                     * alone lets the browser squeeze six columns into 328px and wrap
                     * every header instead of overflowing to the scroll wrapper.
                     */}
                    <Table className="min-w-[44rem]">
                        <TableHeader>
                            <TableRow>
                                {COLUMNS.map((column) => {
                                    const active = sort.key === column.key;

                                    return (
                                        <TableHead
                                            key={column.key}
                                            aria-sort={
                                                active
                                                    ? sort.dir === "asc"
                                                        ? "ascending"
                                                        : "descending"
                                                    : "none"
                                            }
                                            className={cn(
                                                column.numeric && "text-right"
                                            )}
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleSort(
                                                        column.key,
                                                        column.numeric
                                                    )
                                                }
                                                className={cn(
                                                    "inline-flex items-center gap-1 rounded-sm text-xs font-semibold uppercase tracking-[0.06em]",
                                                    "outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                                                    active
                                                        ? "text-foreground"
                                                        : "text-muted-foreground hover:text-foreground",
                                                    column.numeric &&
                                                        "flex-row-reverse"
                                                )}
                                            >
                                                {column.label}
                                                {active ? (
                                                    sort.dir === "asc" ? (
                                                        <ArrowUp className="size-3.5" />
                                                    ) : (
                                                        <ArrowDown className="size-3.5" />
                                                    )
                                                ) : null}
                                            </button>
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <Avatar
                                                name={row.fullName}
                                                size="sm"
                                                ring
                                            />
                                            <span className="min-w-0">
                                                <span className="flex items-center gap-2">
                                                    <span className="truncate font-medium">
                                                        {row.fullName}
                                                    </span>
                                                    {row.isSelf ? (
                                                        <span className="shrink-0 rounded-full border px-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                            You
                                                        </span>
                                                    ) : null}
                                                </span>
                                                {row.email ? (
                                                    <a
                                                        href={`mailto:${row.email}`}
                                                        className="block truncate text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                                                    >
                                                        {row.email}
                                                    </a>
                                                ) : null}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <Count value={row.work?.assigned} />
                                    <Count value={row.work?.active} />
                                    <Count value={row.work?.completed} highlight="success" />
                                    <Count value={row.work?.blocked} highlight="danger" />
                                    <Count value={row.work?.overdue} highlight="danger" />
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell>
                                    Total across {formatNumber(rows.length)}
                                </TableCell>
                                <TotalCell value={totals.assigned} />
                                <TotalCell value={totals.active} />
                                <TotalCell value={totals.completed} />
                                <TotalCell value={totals.blocked} />
                                <TotalCell value={totals.overdue} />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            )}
        </div>
    );
}

/**
 * A member absent from the report has no figure rather than a zero, so an empty
 * cell is drawn as a dash — otherwise "0 overdue" would read as a clean record
 * when the rollup simply had nothing to say about that person.
 */
function Count({
    value,
    highlight,
}: {
    value: number | undefined;
    highlight?: "success" | "danger";
}) {
    return (
        <TableCell className="text-right tabular-nums">
            {value === undefined ? (
                <span className="text-muted-foreground">—</span>
            ) : (
                <span
                    className={cn(
                        highlight === "danger" &&
                            value > 0 &&
                            "text-destructive font-medium",
                        highlight === "success" && value > 0 && "text-success"
                    )}
                >
                    {formatNumber(value)}
                </span>
            )}
        </TableCell>
    );
}

function TotalCell({ value }: { value: number }) {
    return (
        <TableCell className="text-right font-medium tabular-nums">
            {formatNumber(value)}
        </TableCell>
    );
}

function LoadingTable() {
    return (
        <div role="status" aria-label="Loading members" className="space-y-4">
            <Skeleton className="h-4 w-64" />
            <div className="overflow-hidden rounded-xl border bg-card">
                <div className="border-b px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                </div>
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
                    >
                        <Skeleton className="size-7 rounded-full" />
                        <Skeleton className="h-4 w-2/5" />
                        <Skeleton className="h-4 flex-1 opacity-70" />
                        <Skeleton className="h-4 w-8" />
                    </div>
                ))}
            </div>
        </div>
    );
}
