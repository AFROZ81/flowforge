import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
    paramsWith,
    parseParam,
    searchWith,
} from "@/lib/query-params";
import {
    CircleAlert,
    Download,
    Loader2,
    RefreshCw,
    Search,
    X,
} from "lucide-react";

import {
    reportsService,
    type AssigneeSummary,
    type LabelUsage,
    type ProductivityPoint,
    type ProjectSummary,
    type WorkItemSummary,
} from "../api/reports.service";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyStateCard } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import PillNav from "@/components/ui/pill-nav";
import DataSection from "@/components/ui/data-section";
import FigureStrip from "@/components/ui/figure-strip";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AppLayout from "@/layouts/AppLayout";

type ReportId =
    | "work-items"
    | "projects"
    | "assignees"
    | "labels"
    | "productivity";

/**
 * One line of names. An icon-per-entry list is what made an earlier version
 * look like a second sidebar.
 */
interface ReportEntry {
    id: ReportId;
    label: string;
}

const REPORTS: readonly ReportEntry[] = [
    { id: "work-items", label: "Work items" },
    { id: "projects", label: "Projects" },
    { id: "assignees", label: "Team" },
    { id: "labels", label: "Labels" },
    { id: "productivity", label: "Productivity" },
];

const PERIODS = [7, 14, 30, 60, 90];

const DEFAULT_REPORT: ReportId = "work-items";
const DEFAULT_PERIOD = 30;

const REPORT_LABEL = Object.fromEntries(
    REPORTS.map((report) => [report.id, report.label])
) as Record<ReportId, string>;

/* Both view parameters live in the URL, so neither is trusted before it parses. */
const REPORT_IDS = REPORTS.map((entry) => entry.id);

function parsePeriod(value: string | null): number {
    const parsed = Number(value);

    return PERIODS.includes(parsed) ? parsed : DEFAULT_PERIOD;
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat("en-IN").format(
        Number.isFinite(value) ? value : 0
    );
}

function formatPercentage(value: number): string {
    return Number.isFinite(value) ? `${Number(value.toFixed(1))}%` : "0%";
}

function formatDate(value: string): string {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString(undefined, {
              day: "2-digit",
              month: "short",
          });
}

function ofTotal(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
}

/* -------------------------------------------------------------------------- */
/* Building blocks                                                            */
/* -------------------------------------------------------------------------- */

/** Bar plus its percentage, so a column can be read at a glance and exactly. */
function Share({ value, total }: { value: number; total: number }) {
    const percentage = ofTotal(value, total);

    return (
        <div className="flex min-w-28 items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-foreground/10">
                <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, percentage)}%` }}
                />
            </div>
            <span className="w-11 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {formatPercentage(percentage)}
            </span>
        </div>
    );
}

const NUMERIC_HEAD = "text-right";
const NUMERIC_CELL = "text-right tabular-nums";

/* -------------------------------------------------------------------------- */
/* Reports                                                                    */
/* -------------------------------------------------------------------------- */

function WorkItemsReport({ data }: { data: WorkItemSummary }) {
    const measures: { label: string; value: number }[] = [
        { label: "Assigned", value: data.assigned },
        { label: "Unassigned", value: data.unassigned },
        { label: "Active", value: data.active },
        { label: "Completed", value: data.completed },
        { label: "Blocked", value: data.blocked },
        { label: "Overdue", value: data.overdue },
        { label: "Archived", value: data.archived },
    ];

    return (
        <>
            <FigureStrip
                figures={[
                    { label: "Work items", value: formatNumber(data.total) },
                    {
                        label: "Completion",
                        value: formatPercentage(ofTotal(data.completed, data.total)),
                        tone: "success",
                    },
                    {
                        label: "Blocked",
                        value: formatNumber(data.blocked),
                        tone: data.blocked > 0 ? "danger" : "default",
                    },
                    {
                        label: "Overdue",
                        value: formatNumber(data.overdue),
                        tone: data.overdue > 0 ? "danger" : "default",
                    },
                    {
                        label: "Unassigned",
                        value: formatNumber(data.unassigned),
                        tone: data.unassigned > 0 ? "danger" : "default",
                    },
                ]}
            />

            <DataSection
                number={1}
                title="Measures"
                note="Counts are not mutually exclusive; share is of all work items"
            >
                <Table className="min-w-[26rem]">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Measure</TableHead>
                            <TableHead className={NUMERIC_HEAD}>Count</TableHead>
                            <TableHead>Share</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {measures.map((measure) => (
                            <TableRow key={measure.label}>
                                <TableCell className="font-medium">
                                    {measure.label}
                                </TableCell>
                                <TableCell className={NUMERIC_CELL}>
                                    {formatNumber(measure.value)}
                                </TableCell>
                                <TableCell>
                                    <Share
                                        value={measure.value}
                                        total={data.total}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell>Total work items</TableCell>
                            <TableCell className={NUMERIC_CELL}>
                                {formatNumber(data.total)}
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableFooter>
                </Table>
            </DataSection>
        </>
    );
}

function ProjectsReport({ data }: { data: ProjectSummary[] }) {
    const totals = data.reduce(
        (accumulator, project) => ({
            total: accumulator.total + project.total,
            active: accumulator.active + project.active,
            completed: accumulator.completed + project.completed,
            blocked: accumulator.blocked + project.blocked,
        }),
        { total: 0, active: 0, completed: 0, blocked: 0 }
    );

    return (
        <>
            <FigureStrip
                figures={[
                    { label: "Projects", value: formatNumber(data.length) },
                    { label: "Work items", value: formatNumber(totals.total) },
                    {
                        label: "Completed",
                        value: formatNumber(totals.completed),
                        tone: "success",
                    },
                    {
                        label: "Blocked",
                        value: formatNumber(totals.blocked),
                        tone: totals.blocked > 0 ? "danger" : "default",
                    },
                ]}
            />

            <DataSection number={1} title="Project delivery">
                <Table className="min-w-[40rem]">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Project</TableHead>
                            <TableHead className={NUMERIC_HEAD}>Items</TableHead>
                            <TableHead className={NUMERIC_HEAD}>Active</TableHead>
                            <TableHead className={NUMERIC_HEAD}>Completed</TableHead>
                            <TableHead className={NUMERIC_HEAD}>Blocked</TableHead>
                            <TableHead>Completion</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((project) => (
                            <TableRow key={project.projectId}>
                                <TableCell className="max-w-64 truncate font-medium">
                                    {project.projectName}
                                </TableCell>
                                <TableCell className={NUMERIC_CELL}>
                                    {formatNumber(project.total)}
                                </TableCell>
                                <TableCell className={NUMERIC_CELL}>
                                    {formatNumber(project.active)}
                                </TableCell>
                                <TableCell className={NUMERIC_CELL}>
                                    {formatNumber(project.completed)}
                                </TableCell>
                                <TableCell className={NUMERIC_CELL}>
                                    {project.blocked > 0 ? (
                                        <span className="text-destructive">
                                            {formatNumber(project.blocked)}
                                        </span>
                                    ) : (
                                        "0"
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Share
                                        value={project.completed}
                                        total={project.total}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell>Total</TableCell>
                            <TableCell className={NUMERIC_CELL}>
                                {formatNumber(totals.total)}
                            </TableCell>
                            <TableCell className={NUMERIC_CELL}>
                                {formatNumber(totals.active)}
                            </TableCell>
                            <TableCell className={NUMERIC_CELL}>
                                {formatNumber(totals.completed)}
                            </TableCell>
                            <TableCell className={NUMERIC_CELL}>
                                {formatNumber(totals.blocked)}
                            </TableCell>
                            <TableCell>
                                <Share
                                    value={totals.completed}
                                    total={totals.total}
                                />
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </DataSection>
        </>
    );
}

function TeamReport({ data }: { data: AssigneeSummary[] }) {
    const totals = data.reduce(
        (accumulator, member) => ({
            assigned: accumulator.assigned + member.assigned,
            active: accumulator.active + member.active,
            completed: accumulator.completed + member.completed,
            blocked: accumulator.blocked + member.blocked,
            overdue: accumulator.overdue + member.overdue,
        }),
        { assigned: 0, active: 0, completed: 0, blocked: 0, overdue: 0 }
    );

    return (
        <>
            <FigureStrip
                figures={[
                    { label: "Members with work", value: formatNumber(data.length) },
                    { label: "Assigned", value: formatNumber(totals.assigned) },
                    {
                        label: "Completed",
                        value: formatNumber(totals.completed),
                        tone: "success",
                    },
                    {
                        label: "Overdue",
                        value: formatNumber(totals.overdue),
                        tone: totals.overdue > 0 ? "danger" : "default",
                    },
                ]}
            />

            <DataSection number={1} title="Workload by member">
                <Table className="min-w-[44rem]">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead className={NUMERIC_HEAD}>Assigned</TableHead>
                            <TableHead className={NUMERIC_HEAD}>Active</TableHead>
                            <TableHead className={NUMERIC_HEAD}>Completed</TableHead>
                            <TableHead className={NUMERIC_HEAD}>Blocked</TableHead>
                            <TableHead className={NUMERIC_HEAD}>Overdue</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((member) => (
                            <TableRow key={member.userId}>
                                <TableCell>
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <Avatar name={member.fullName} size="sm" />
                                        <span className="min-w-0">
                                            <span className="block truncate font-medium">
                                                {member.fullName}
                                            </span>
                                            <span className="block truncate text-xs text-muted-foreground">
                                                {member.email}
                                            </span>
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className={NUMERIC_CELL}>
                                    {formatNumber(member.assigned)}
                                </TableCell>
                                <TableCell className={NUMERIC_CELL}>
                                    {formatNumber(member.active)}
                                </TableCell>
                                <TableCell className={NUMERIC_CELL}>
                                    {formatNumber(member.completed)}
                                </TableCell>
                                <TableCell className={NUMERIC_CELL}>
                                    {member.blocked > 0 ? (
                                        <span className="text-destructive">
                                            {formatNumber(member.blocked)}
                                        </span>
                                    ) : (
                                        "0"
                                    )}
                                </TableCell>
                                <TableCell className={NUMERIC_CELL}>
                                    {member.overdue > 0 ? (
                                        <span className="text-destructive">
                                            {formatNumber(member.overdue)}
                                        </span>
                                    ) : (
                                        "0"
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell>Total</TableCell>
                            <TableCell className={NUMERIC_CELL}>
                                {formatNumber(totals.assigned)}
                            </TableCell>
                            <TableCell className={NUMERIC_CELL}>
                                {formatNumber(totals.active)}
                            </TableCell>
                            <TableCell className={NUMERIC_CELL}>
                                {formatNumber(totals.completed)}
                            </TableCell>
                            <TableCell className={NUMERIC_CELL}>
                                {formatNumber(totals.blocked)}
                            </TableCell>
                            <TableCell className={NUMERIC_CELL}>
                                {formatNumber(totals.overdue)}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </DataSection>
        </>
    );
}

function LabelsReport({ data }: { data: LabelUsage[] }) {
    const totalUses = data.reduce(
        (accumulator, label) => accumulator + label.usageCount,
        0
    );

    return (
        <>
            <FigureStrip
                figures={[
                    { label: "Labels in use", value: formatNumber(data.length) },
                    { label: "Total uses", value: formatNumber(totalUses) },
                    {
                        label: "Most used",
                        value:
                            data.length > 0
                                ? `${data[0].name} (${formatNumber(data[0].usageCount)})`
                                : "—",
                    },
                ]}
            />

            <DataSection number={1} title="Label usage">
                <Table className="min-w-[24rem]">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Label</TableHead>
                            <TableHead className={NUMERIC_HEAD}>Uses</TableHead>
                            <TableHead>Share</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((label) => (
                            <TableRow key={label.labelId}>
                                <TableCell>
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span
                                            className="size-2.5 shrink-0 rounded-full ring-1 ring-inset ring-foreground/20"
                                            style={{
                                                background:
                                                    label.color || undefined,
                                            }}
                                        />
                                        <span className="truncate font-medium">
                                            {label.name}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className={NUMERIC_CELL}>
                                    {formatNumber(label.usageCount)}
                                </TableCell>
                                <TableCell>
                                    <Share
                                        value={label.usageCount}
                                        total={totalUses}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell>Total uses</TableCell>
                            <TableCell className={NUMERIC_CELL}>
                                {formatNumber(totalUses)}
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableFooter>
                </Table>
            </DataSection>
        </>
    );
}

function ProductivityReport({ data }: { data: ProductivityPoint[] }) {
    const totals = data.reduce(
        (accumulator, point) => ({
            created: accumulator.created + point.created,
            completed: accumulator.completed + point.completed,
        }),
        { created: 0, completed: 0 }
    );

    const peak = data.reduce(
        (maximum, point) =>
            Math.max(maximum, point.created, point.completed),
        0
    );

    const net = totals.completed - totals.created;

    return (
        <>
            <FigureStrip
                figures={[
                    { label: "Days reported", value: formatNumber(data.length) },
                    { label: "Created", value: formatNumber(totals.created) },
                    {
                        label: "Completed",
                        value: formatNumber(totals.completed),
                        tone: "success",
                    },
                    {
                        label: "Net",
                        value: `${net > 0 ? "+" : ""}${formatNumber(net)}`,
                        tone: net > 0 ? "success" : net < 0 ? "danger" : "default",
                    },
                ]}
            />

            <DataSection
                number={1}
                title="Daily activity"
                note="Bars are scaled to the busiest day"
            >
                <Table className="min-w-[28rem]">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead className={NUMERIC_HEAD}>Created</TableHead>
                            <TableHead className={NUMERIC_HEAD}>Completed</TableHead>
                            <TableHead className={NUMERIC_HEAD}>Net</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((point) => {
                            const dayNet = point.completed - point.created;

                            return (
                                <TableRow key={point.date}>
                                    <TableCell className="whitespace-nowrap font-medium tabular-nums">
                                        {formatDate(point.date)}
                                    </TableCell>
                                    <TableCell className={NUMERIC_CELL}>
                                        <Scaled
                                            value={point.created}
                                            peak={peak}
                                        />
                                    </TableCell>
                                    <TableCell className={NUMERIC_CELL}>
                                        <Scaled
                                            value={point.completed}
                                            peak={peak}
                                            emphasis
                                        />
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            NUMERIC_CELL,
                                            dayNet > 0 && "text-success",
                                            dayNet < 0 && "text-destructive"
                                        )}
                                    >
                                        {dayNet > 0 ? "+" : ""}
                                        {formatNumber(dayNet)}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell>Total</TableCell>
                            <TableCell className={NUMERIC_CELL}>
                                {formatNumber(totals.created)}
                            </TableCell>
                            <TableCell className={NUMERIC_CELL}>
                                {formatNumber(totals.completed)}
                            </TableCell>
                            <TableCell className={NUMERIC_CELL}>
                                {net > 0 ? "+" : ""}
                                {formatNumber(net)}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </DataSection>
        </>
    );
}

/** A number with a bar behind it, sized against the series peak rather than 100%. */
function Scaled({
    value,
    peak,
    emphasis = false,
}: {
    value: number;
    peak: number;
    emphasis?: boolean;
}) {
    return (
        <div className="flex items-center justify-end gap-2">
            <div className="h-1.5 w-16 rounded-full bg-foreground/10">
                <div
                    className={cn(
                        "h-full rounded-full",
                        emphasis ? "bg-success" : "bg-primary/60"
                    )}
                    style={{
                        width: `${peak > 0 ? Math.min(100, (value / peak) * 100) : 0}%`,
                    }}
                />
            </div>
            <span className="w-8 text-right tabular-nums">
                {formatNumber(value)}
            </span>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

type ListRow = ProjectSummary | AssigneeSummary | LabelUsage;

/** Discriminated by shape: the three list reports have disjoint key fields. */
function searchableText(row: ListRow): string {
    if ("projectName" in row) {
        return row.projectName.toLowerCase();
    }

    if ("fullName" in row) {
        return `${row.fullName} ${row.email}`.toLowerCase();
    }

    return row.name.toLowerCase();
}

function loadReportData(
    report: ReportId,
    days: number
): Promise<
    | WorkItemSummary
    | ProjectSummary[]
    | AssigneeSummary[]
    | LabelUsage[]
    | ProductivityPoint[]
> {
    switch (report) {
        case "work-items":
            return reportsService.getWorkItemSummary();
        case "projects":
            return reportsService.getProjectSummary();
        case "assignees":
            return reportsService.getAssigneeSummary();
        case "labels":
            return reportsService.getLabelUsage();
        case "productivity":
            return reportsService.getProductivityTrends(days);
    }
}

/** Shared by the query and the hover prefetch so their keys can never drift apart. */
function reportQueryOptions(report: ReportId, days: number) {
    return {
        queryKey: ["reports", report, days] as const,
        queryFn: () => loadReportData(report, days),
    };
}

const ReportsPage = () => {
    const [params, setParams] = useSearchParams();
    const queryClient = useQueryClient();

    /*
     * Which report is open, and over what period, live in the URL rather than in
     * component state: a refresh keeps the view, the back button walks through the
     * reports you have looked at, and the address bar can be pasted into chat.
     */
    const {
        value: report,
        invalid: unknownReport,
    } = parseParam<ReportId>(
        params.get("report"),
        REPORT_IDS,
        DEFAULT_REPORT
    );
    const days = parsePeriod(params.get("days"));

    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    /*
     * A filter typed for one report must not follow you into the next. Adjusting
     * during render rather than in an effect is the pattern AppLayout already
     * uses for the same problem: the reset commits in the pass that changes.
     */
    const [lastReport, setLastReport] = useState(report);

    if (lastReport !== report) {
        setLastReport(report);
        setSearch("");
    }

    const setPeriod = useCallback(
        (period: number) => {
            /*
             * Dropping the parameter at its default keeps the URL short.
             * Replacing rather than pushing: stepping through ranges should not
             * become five history entries to back out of.
             */
            setParams(
                (current) =>
                    paramsWith(current, {
                        days: period === DEFAULT_PERIOD ? null : String(period),
                    }),
                { replace: true }
            );
        },
        [setParams]
    );

    /**
     * Hovering or focusing a catalog entry warms that report's cache, so the
     * click paints from memory instead of showing a skeleton first.
     */
    const prefetchReport = useCallback(
        (id: ReportId) => {
            void queryClient.prefetchQuery(reportQueryOptions(id, days));
        },
        [queryClient, days]
    );

    /*
     * A shared link naming a report we do not have falls back to the default
     * view above; this also cleans the address bar so it does not claim to be a
     * report the page is not showing. Only fires when the parameter is bogus.
     */
    useEffect(() => {
        if (!unknownReport) {
            return;
        }

        setParams((current) => paramsWith(current, { report: null }), {
            replace: true,
        });
    }, [unknownReport, setParams]);

    /*
     * One report is on screen at a time, so one query keyed by its parameters
     * replaces the old stack of per-report states plus a fetch effect. Switching
     * reports changes the key, which clears data and shows the skeleton rather
     * than painting the previous report under a new title.
     */
    const {
        data,
        isPending,
        isFetching,
        error: loadError,
        dataUpdatedAt,
        refetch,
    } = useQuery(reportQueryOptions(report, days));

    const handleExport = useCallback(async () => {
        setExporting(true);
        setExportError(null);

        try {
            await reportsService.exportWorkItems();
        } catch (cause) {
            console.error("Reports: export failed", cause);
            setExportError(
                "The export could not be prepared. Please try again."
            );
        } finally {
            setExporting(false);
        }
    }, []);

    const query = search.trim().toLowerCase();
    const filterable =
        report === "projects" || report === "assignees" || report === "labels";

    const listRows = useMemo(() => {
        if (!filterable) {
            return [] as ListRow[];
        }

        const source = (data ?? []) as ListRow[];

        return query
            ? source.filter((row) => searchableText(row).includes(query))
            : source;
    }, [data, filterable, query]);

    const rows = filterable
        ? listRows
        : ((data ?? []) as ProductivityPoint[]);

    const rowCount =
        report === "work-items"
            ? ((data as WorkItemSummary | undefined)?.total ?? 0)
            : rows.length;

    const error = loadError
        ? "The report could not be loaded. Please try again."
        : exportError;

    const body = () => {
        if (report === "work-items") {
            return data ? (
                <WorkItemsReport data={data as WorkItemSummary} />
            ) : (
                <NoData label="work-item" />
            );
        }

        if (rows.length === 0) {
            return (
                <NoData
                    label={REPORT_LABEL[report].toLowerCase()}
                    filtered={filterable && query.length > 0}
                />
            );
        }

        switch (report) {
            case "projects":
                return <ProjectsReport data={rows as ProjectSummary[]} />;
            case "assignees":
                return <TeamReport data={rows as AssigneeSummary[]} />;
            case "labels":
                return <LabelsReport data={rows as LabelUsage[]} />;
            default:
                return <ProductivityReport data={rows as ProductivityPoint[]} />;
        }
    };

    const metadata = [
        "Scope: entire workspace",
        report === "productivity" ? `Last ${days} days` : "All time",
        dataUpdatedAt > 0
            ? `Prepared ${new Date(dataUpdatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
              })}`
            : null,
    ]
        .filter(Boolean)
        .join("  ·  ");

    return (
        <AppLayout>
            <PageHeader
                title="Reports"
                actions={
                    <>
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => void refetch()}
                            disabled={isFetching}
                        >
                            {isFetching ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <RefreshCw />
                            )}
                            Refresh
                        </Button>
                        {/* The backend exposes a single export, so name its report. */}
                        <Button
                            type="button"
                            size="lg"
                            onClick={() => void handleExport()}
                            disabled={exporting}
                        >
                            {exporting ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <Download />
                            )}
                            Export work items (.xlsx)
                        </Button>
                    </>
                }
                toolbar={
                    <PillNav
                        ariaLabel="Reports"
                        active={report}
                        onPrefetch={prefetchReport}
                        items={REPORTS.map((entry) => ({
                            id: entry.id,
                            label: entry.label,
                            // Defaults stay out of the address bar: /reports is the usual URL.
                            href: searchWith(params, {
                                report:
                                    entry.id === DEFAULT_REPORT
                                        ? null
                                        : entry.id,
                            }),
                        }))}
                    />
                }
            />

            {/*
             * One column, full width. The report views belong to this page, so
             * they run across the top of the document rather than down a second
             * rail beside the application sidebar.
             *
             * The rhythm is deliberately wider than the 16px inside a summary
             * row: a section has to sit further from its neighbour than a
             * figure sits from the next figure, or the summary stops reading as
             * a group of four and becomes a fifth table.
             */}
            <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
                {error ? (
                    <div
                        role="alert"
                        className="flex flex-wrap items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                    >
                        <CircleAlert className="size-4 shrink-0" />
                        <span className="min-w-0 flex-1">{error}</span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void refetch()}
                        >
                            Retry
                        </Button>
                    </div>
                ) : null}

                {/* The open report: its name and parameters, above its sections. */}
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-foreground">
                            {REPORT_LABEL[report]}
                        </h2>
                        <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                            {metadata}
                            {isPending ? null : `  ·  ${formatNumber(rowCount)} rows`}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {report === "productivity" ? (
                            <PeriodFilter days={days} onSelect={setPeriod} />
                        ) : null}

                        {filterable ? (
                            <div className="relative min-w-0 flex-1 sm:flex-none">
                                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder={`Filter ${REPORT_LABEL[report].toLowerCase()}`}
                                    aria-label={`Filter ${REPORT_LABEL[report]}`}
                                    className="h-8 w-full pl-8 pr-8 sm:w-56"
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
                        ) : null}
                    </div>
                </div>

                {isPending ? <Loading /> : body()}
            </div>
        </AppLayout>
    );
};

/* -------------------------------------------------------------------------- */
/* View controls                                                              */
/* -------------------------------------------------------------------------- */

/** Segmented rather than a select: the whole range choice is visible in one glance. */
function PeriodFilter({
    days,
    onSelect,
}: {
    days: number;
    onSelect: (days: number) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <span
                id="reports-period"
                className="text-xs font-medium text-muted-foreground"
            >
                Period
            </span>
            <div
                role="group"
                aria-labelledby="reports-period"
                className="flex items-center gap-0.5 rounded-lg border bg-card p-0.5"
            >
                {PERIODS.map((period) => {
                    const selected = period === days;

                    return (
                        <button
                            key={period}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => onSelect(period)}
                            className={cn(
                                "h-7 rounded-md px-2.5 text-xs font-medium tabular-nums",
                                "outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                                selected
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                            )}
                        >
                            {period}d
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function Loading() {
    return (
        <div
            role="status"
            aria-label="Loading report"
            className="flex flex-col gap-5 lg:gap-6"
        >
            {/* Mirrors the loaded summary row exactly - four separate cards,
                same floor width - otherwise the row re-joins itself and the
                whole page jumps as the tiles resize when the data lands. */}
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(10rem,1fr))] sm:gap-4">
                {[0, 1, 2, 3].map((index) => (
                    <div
                        key={index}
                        className="rounded-xl border bg-card px-4 py-3.5 shadow-xs"
                    >
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="mt-2.5 h-7 w-14" />
                    </div>
                ))}
            </div>
            <div className="overflow-hidden rounded-xl border bg-card">
                <div className="border-b px-4 py-3">
                    <Skeleton className="h-4 w-40" />
                </div>
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
                    >
                        <Skeleton className="h-4 w-2/5" />
                        <Skeleton className="h-4 flex-1 opacity-70" />
                        <Skeleton className="h-4 w-10" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function NoData({ label, filtered }: { label: string; filtered?: boolean }) {
    return (
        <EmptyStateCard
            icon={CircleAlert}
            size="sm"
            title={filtered ? "No matching rows" : "Nothing to report"}
            description={
                filtered
                    ? `No ${label} rows match the current filter.`
                    : `There is no ${label} data in this workspace yet.`
            }
        />
    );
}

export default ReportsPage;
