import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Activity,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock3,
    RefreshCw,
    Search,
    ShieldAlert,
    ShieldCheck,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import DataSection from "@/components/ui/data-section";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState, ErrorStateBlock } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { PageHeader } from "@/components/ui/page-header";
import FigureStrip from "@/components/ui/figure-strip";
import AppLayout from "@/layouts/AppLayout";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

import {
    auditLogsService,
    type AuditLogEntry,
    type AuditLogFilters,
} from "../api/audit-logs.service";

const PAGE_SIZE = 25;

function formatNumber(value: number): string {
    return new Intl.NumberFormat().format(value);
}

function formatEventType(value: string): string {
    return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function formatTimestamp(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function formatRelative(value: string): string | null {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    const seconds = Math.round((date.getTime() - Date.now()) / 1000);
    const abs = Math.abs(seconds);

    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    if (abs < 60) return rtf.format(seconds, "second");
    if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
    if (abs < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
    if (abs < 604800) return rtf.format(Math.round(seconds / 86400), "day");
    if (abs < 2592000) return rtf.format(Math.round(seconds / 604800), "week");
    if (abs < 31536000) return rtf.format(Math.round(seconds / 2592000), "month");
    return rtf.format(Math.round(seconds / 31536000), "year");
}

function shortId(value: string | null): string {
    return value ? value.slice(0, 8) : "—";
}

function formatJson(value: string): string {
    try {
        return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
        return value;
    }
}

function hasJsonValue(value: string): boolean {
    return value !== "" && value !== "{}" && value !== "null";
}

function AuditLogDetails({ entry }: { entry: AuditLogEntry }) {
    const details = [
        { label: "Previous values", value: entry.oldValuesJson },
        { label: "New values", value: entry.newValuesJson },
        { label: "Metadata", value: entry.metadataJson },
    ].filter((detail) => hasJsonValue(detail.value));

    return (
        <div className="space-y-4 border-t border-border-subtle px-4 pt-4 pb-1">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                    <p className="text-xs font-medium text-muted-foreground">
                        Target ID
                    </p>
                    <p className="mt-1 break-all font-mono text-xs text-foreground">
                        {entry.targetEntityId ?? "Not recorded"}
                    </p>
                </div>
                <div>
                    <p className="text-xs font-medium text-muted-foreground">
                        Actor IP address
                    </p>
                    <p className="mt-1 font-mono text-xs text-foreground">
                        {entry.actorIpAddress || "Not recorded"}
                    </p>
                </div>
            </div>

            {details.length > 0 ? (
                <div className="grid gap-3 lg:grid-cols-3">
                    {details.map((detail) => (
                        <div
                            key={detail.label}
                            className="min-w-0 overflow-hidden rounded-lg border border-border-subtle bg-surface-muted/60"
                        >
                            <h4 className="border-b border-border-subtle px-3 py-2 text-xs font-semibold text-foreground">
                                {detail.label}
                            </h4>
                            <pre className="max-h-56 overflow-auto p-3 text-xs leading-relaxed text-muted-foreground">
                                {formatJson(detail.value)}
                            </pre>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">
                    No additional change details were recorded.
                </p>
            )}
        </div>
    );
}

function AuditLogEntryCard({
    entry,
    expanded,
    onToggle,
    isLast,
}: {
    entry: AuditLogEntry;
    expanded: boolean;
    onToggle: () => void;
    isLast: boolean;
}) {
    const label = entry.action || formatEventType(entry.type);
    const relative = formatRelative(entry.createdAt);

    return (
        <li className="relative flex gap-4">
            {/* Timeline rail + node */}
            <div className="relative flex w-9 shrink-0 justify-center">
                {!isLast ? (
                    <span
                        aria-hidden="true"
                        className="absolute top-9 bottom-0 left-1/2 w-px -translate-x-1/2 bg-border"
                    />
                ) : null}
                <span
                    aria-hidden="true"
                    className={cn(
                        "relative z-10 flex size-9 items-center justify-center rounded-full ring-4 ring-card",
                        entry.isSensitive
                            ? "bg-warning-subtle text-warning-foreground"
                            : "bg-primary-subtle text-primary"
                    )}
                >
                    {entry.isSensitive ? (
                        <ShieldAlert className="size-4" strokeWidth={1.9} />
                    ) : (
                        <Activity className="size-4" strokeWidth={1.9} />
                    )}
                </span>
            </div>

            {/* Event card */}
            <div className="min-w-0 flex-1 pb-3">
                <div
                    className={cn(
                        "overflow-hidden rounded-xl border bg-card shadow-xs transition-colors",
                        expanded
                            ? "border-border-strong"
                            : "border-border hover:border-border-strong"
                    )}
                >
                    <div className="flex items-start gap-3 p-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="text-sm font-medium text-foreground">
                                    {label}
                                </span>
                                {entry.isSensitive ? (
                                    <span className="rounded-full bg-warning-subtle px-2 py-0.5 text-[11px] font-medium text-warning-foreground">
                                        Sensitive
                                    </span>
                                ) : null}
                            </div>

                            {entry.description ? (
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                    {entry.description}
                                </p>
                            ) : null}

                            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                    <span
                                        aria-hidden="true"
                                        className="size-1.5 rounded-full bg-muted-foreground/50"
                                    />
                                    {entry.actorName || "System"}
                                </span>

                                <span className="inline-flex items-center gap-1.5">
                                    <span
                                        aria-hidden="true"
                                        className="size-1.5 rounded-full bg-muted-foreground/50"
                                    />
                                    {entry.targetEntityType || "—"}
                                    {entry.targetEntityId ? (
                                        <span className="font-mono text-[11px]">
                                            {shortId(entry.targetEntityId)}
                                        </span>
                                    ) : null}
                                </span>

                                <span className="inline-flex items-center gap-1.5">
                                    <span
                                        aria-hidden="true"
                                        className="size-1.5 rounded-full bg-muted-foreground/50"
                                    />
                                    {formatEventType(entry.type)}
                                </span>
                            </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`${expanded ? "Hide" : "Show"} details for ${label}`}
                                aria-expanded={expanded}
                                onClick={onToggle}
                            >
                                <ChevronDown
                                    aria-hidden="true"
                                    className={cn(
                                        "transition-transform",
                                        expanded && "rotate-180"
                                    )}
                                />
                            </Button>
                            <time
                                dateTime={entry.createdAt}
                                title={formatTimestamp(entry.createdAt)}
                                className="whitespace-nowrap text-[11px] text-muted-foreground"
                            >
                                {relative ?? formatTimestamp(entry.createdAt)}
                            </time>
                        </div>
                    </div>

                    {expanded ? <AuditLogDetails entry={entry} /> : null}
                </div>
            </div>
        </li>
    );
}

function AuditLogSkeleton() {
    return (
        <li className="flex gap-4">
            <div className="relative flex w-9 shrink-0 justify-center">
                <span className="absolute top-9 bottom-0 left-1/2 w-px -translate-x-1/2 bg-border" />
                <span className="relative z-10 size-9 animate-pulse rounded-full bg-surface-muted ring-4 ring-card" />
            </div>
            <div className="min-w-0 flex-1 pb-3">
                <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-xs">
                    <div className="h-4 w-40 animate-pulse rounded bg-surface-muted" />
                    <div className="h-3 w-full max-w-md animate-pulse rounded bg-surface-muted" />
                    <div className="flex gap-3">
                        <div className="h-3 w-20 animate-pulse rounded bg-surface-muted" />
                        <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
                        <div className="h-3 w-16 animate-pulse rounded bg-surface-muted" />
                    </div>
                </div>
            </div>
        </li>
    );
}

export default function AuditLogsPage() {
    const organizationId = useAuthStore(
        (state) => state.user?.organizationId
    );
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState("");
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const [sensitive, setSensitive] = useState("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setSearch(searchText.trim());
            setPage(1);
        }, 300);

        return () => window.clearTimeout(timer);
    }, [searchText]);

    const filters: AuditLogFilters = {
        page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        type: type || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        isSensitive:
            sensitive === "all" ? undefined : sensitive === "sensitive",
    };

    const {
        data: statistics,
        isPending: statisticsPending,
        isError: statisticsError,
        error: statisticsErrorValue,
        refetch: refetchStatistics,
    } = useQuery({
        queryKey: ["audit-logs", organizationId, "statistics"],
        queryFn: auditLogsService.getAuditLogStatistics,
    });

    const {
        data,
        isPending,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["audit-logs", organizationId, filters],
        queryFn: () => auditLogsService.getAuditLogs(filters),
        placeholderData: (previousData) => previousData,
    });

    const typeOptions = Object.keys(statistics?.byType ?? {}).sort();
    const totalPages = Math.max(data?.totalPages ?? 0, 1);
    const hasFilters =
        searchText.length > 0 ||
        type.length > 0 ||
        sensitive !== "all" ||
        fromDate.length > 0 ||
        toDate.length > 0;

    function clearFilters() {
        setSearchText("");
        setSearch("");
        setType("");
        setSensitive("all");
        setFromDate("");
        setToDate("");
        setPage(1);
        setExpandedId(null);
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <PageHeader
                    eyebrow="Workspace administration"
                    title="Audit log"
                    description="A clear record of workspace activity and sensitive changes."
                    actions={
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                void refetch();
                                void refetchStatistics();
                            }}
                            disabled={isFetching || statisticsPending}
                        >
                            <RefreshCw
                                className={cn(
                                    (isFetching || statisticsPending) &&
                                        "animate-spin"
                                )}
                            />
                            Refresh
                        </Button>
                    }
                />

                {statisticsError ? (
                    <ErrorState
                        error={statisticsErrorValue}
                        title="Audit statistics are unavailable"
                        description="The event list is still available. Try refreshing the summary."
                        action={
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void refetchStatistics()}
                            >
                                Retry summary
                            </Button>
                        }
                    />
                ) : null}

                {statisticsPending ? (
                    <div
                        aria-label="Loading audit statistics"
                        className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(10rem,1fr))] sm:gap-4"
                    >
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-[6.4rem] animate-pulse rounded-xl border bg-card"
                            />
                        ))}
                    </div>
                ) : statistics ? (
                    <FigureStrip
                        figures={[
                            {
                                label: "Recorded events",
                                value: formatNumber(statistics.totalEntries),
                                icon: Activity,
                            },
                            {
                                label: "Today",
                                value: formatNumber(statistics.todayEntries),
                                icon: Clock3,
                            },
                            {
                                label: "Sensitive events",
                                value: formatNumber(statistics.sensitiveEntries),
                                tone:
                                    statistics.sensitiveEntries > 0
                                        ? "warning"
                                        : "default",
                                icon: ShieldAlert,
                            },
                            {
                                label: "Event types",
                                value: formatNumber(typeOptions.length),
                                icon: ShieldCheck,
                            },
                        ]}
                    />
                ) : null}

                <section
                    aria-label="Audit log filters"
                    className="rounded-xl border border-border bg-card p-4 shadow-xs"
                >
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1.5fr)_minmax(10rem,1fr)_minmax(9rem,0.8fr)_minmax(9rem,0.8fr)_minmax(9rem,0.8fr)_auto]">
                        <label className="relative block">
                            <span className="sr-only">Search audit events</span>
                            <Search
                                aria-hidden="true"
                                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                            />
                            <Input
                                type="search"
                                value={searchText}
                                onChange={(event) =>
                                    setSearchText(event.target.value)
                                }
                                placeholder="Search events, people..."
                                className="pl-9"
                            />
                        </label>

                        <label>
                            <span className="sr-only">Filter by event type</span>
                            <NativeSelect
                                value={type}
                                onChange={(event) => {
                                    setType(event.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">All event types</option>
                                {typeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {formatEventType(option)}
                                    </option>
                                ))}
                            </NativeSelect>
                        </label>

                        <label>
                            <span className="sr-only">Filter sensitive events</span>
                            <NativeSelect
                                value={sensitive}
                                onChange={(event) => {
                                    setSensitive(event.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="all">All activity</option>
                                <option value="sensitive">Sensitive only</option>
                                <option value="regular">Non-sensitive</option>
                            </NativeSelect>
                        </label>

                        <label className="flex items-center gap-2">
                            <span className="shrink-0 text-xs text-muted-foreground">
                                From
                            </span>
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={(event) => {
                                    setFromDate(event.target.value);
                                    setPage(1);
                                }}
                            />
                        </label>

                        <label className="flex items-center gap-2">
                            <span className="shrink-0 text-xs text-muted-foreground">
                                To
                            </span>
                            <Input
                                type="date"
                                value={toDate}
                                onChange={(event) => {
                                    setToDate(event.target.value);
                                    setPage(1);
                                }}
                            />
                        </label>

                        {hasFilters ? (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={clearFilters}
                            >
                                <X />
                                Clear
                            </Button>
                        ) : null}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                        Search by activity, actor, or target. Use dates to
                        narrow the event history.
                    </p>
                </section>

                {isError ? (
                    <ErrorStateBlock
                        error={error}
                        title="We couldn't load the audit log"
                        description="Try again in a moment. If the problem continues, contact your workspace administrator."
                        action={
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => void refetch()}
                            >
                                <RefreshCw />
                                Retry
                            </Button>
                        }
                    />
                ) : (
                    <DataSection
                        title="Activity history"
                        note={
                            data
                                ? `${formatNumber(data.totalCount)} events`
                                : "Loading events"
                        }
                        icon={Activity}
                    >
                        {isPending ? (
                            <ol
                                aria-label="Loading audit events"
                                className="p-4"
                            >
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <AuditLogSkeleton key={index} />
                                ))}
                            </ol>
                        ) : data?.items?.length ? (
                            <>
                                <ol className="p-4">
                                    {data.items.map((entry, index) => (
                                        <AuditLogEntryCard
                                            key={entry.id}
                                            entry={entry}
                                            expanded={expandedId === entry.id}
                                            onToggle={() =>
                                                setExpandedId((current) =>
                                                    current === entry.id
                                                        ? null
                                                        : entry.id
                                                )
                                            }
                                            isLast={
                                                index === data.items.length - 1
                                            }
                                        />
                                    ))}
                                </ol>

                                <div className="flex flex-col gap-3 border-t border-border-subtle px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <p
                                        aria-live="polite"
                                        className="text-xs text-muted-foreground"
                                    >
                                        Page {data.page} of {totalPages}
                                        <span className="mx-1.5">·</span>
                                        Showing{" "}
                                        {formatNumber(data.items.length)} of{" "}
                                        {formatNumber(data.totalCount)} events
                                        {isFetching ? " · Updating..." : ""}
                                    </p>
                                    <nav
                                        aria-label="Audit log pages"
                                        className="flex items-center gap-2"
                                    >
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setPage((current) =>
                                                    Math.max(1, current - 1)
                                                )
                                            }
                                            disabled={page <= 1 || isFetching}
                                        >
                                            <ChevronLeft />
                                            Previous
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setPage((current) =>
                                                    Math.min(
                                                        totalPages,
                                                        current + 1
                                                    )
                                                )
                                            }
                                            disabled={
                                                page >= totalPages || isFetching
                                            }
                                        >
                                            Next
                                            <ChevronRight />
                                        </Button>
                                    </nav>
                                </div>
                            </>
                        ) : (
                            <EmptyState
                                icon={hasFilters ? Search : ShieldCheck}
                                tone={hasFilters ? "neutral" : "brand"}
                                title={
                                    hasFilters
                                        ? "No events match these filters"
                                        : "No audit activity yet"
                                }
                                description={
                                    hasFilters
                                        ? "Try changing or clearing the filters."
                                        : "Workspace events will appear here as activity is recorded."
                                }
                                action={
                                    hasFilters ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={clearFilters}
                                        >
                                            <X />
                                            Clear filters
                                        </Button>
                                    ) : undefined
                                }
                                size="sm"
                                className="py-12"
                            />
                        )}
                    </DataSection>
                )}
            </div>
        </AppLayout>
    );
}