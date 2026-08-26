import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    BriefcaseBusiness,
    CheckCircle2,
    ChevronRight,
    CircleAlert,
    Download,
    FileBarChart2,
    Loader2,
    RefreshCw,
    Search,
    Tags,
    TrendingUp,
    Users,
} from "lucide-react";

import { reportsService } from "../api/reports.service";

import "./reports.css";

type ReportKey =
    | "work-items"
    | "projects"
    | "assignees"
    | "labels"
    | "productivity";

interface WorkItemSummary {
    total: number;
    active: number;
    blocked: number;
    completed: number;
    archived: number;
    assigned: number;
    unassigned: number;
    overdue: number;
}

interface ProjectSummary {
    projectId: string;
    projectName: string;
    total: number;
    active: number;
    completed: number;
    blocked: number;
    completionPercentage: number;
}

interface AssigneeSummary {
    userId: string;
    fullName: string;
    email: string;
    assigned: number;
    active: number;
    completed: number;
    blocked: number;
    overdue: number;
}

interface LabelUsage {
    labelId: string;
    name: string;
    color: string;
    usageCount: number;
}

interface ProductivityPoint {
    date: string;
    created: number;
    completed: number;
}

interface ReportDefinition {
    key: ReportKey;
    title: string;
    description: string;
    category: string;
    icon: React.ReactNode;
}

const REPORTS: ReportDefinition[] = [
    {
        key: "work-items",
        title: "Work Items",
        description: "Operational workload, ownership, delivery status and overdue work.",
        category: "WORK MANAGEMENT",
        icon: <BriefcaseBusiness size={18} />,
    },
    {
        key: "projects",
        title: "Projects",
        description:
            "Compare project workload, delivery progress and completion.",
        category: "WORK MANAGEMENT",
        icon: <FileBarChart2 size={18} />,
    },
    {
        key: "assignees",
        title: "Team Performance",
        description:
            "Understand workload distribution and individual delivery.",
        category: "TEAM",
        icon: <Users size={18} />,
    },
    {
        key: "labels",
        title: "Label Usage",
        description:
            "Understand how labels are being used across the workspace.",
        category: "ORGANIZATION",
        icon: <Tags size={18} />,
    },
    {
        key: "productivity",
        title: "Productivity",
        description:
            "Compare work created and completed over a selected period.",
        category: "TRENDS",
        icon: <TrendingUp size={18} />,
    },
];

function formatNumber(value: number): string {
    return new Intl.NumberFormat("en-IN").format(
        Number.isFinite(value) ? value : 0
    );
}

function formatPercentage(value: number): string {
    if (!Number.isFinite(value)) {
        return "0%";
    }

    return `${Number(value.toFixed(1))}%`;
}

function formatDate(value: string): string {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getInitials(name: string): string {
    const value = name.trim();

    if (!value) {
        return "?";
    }

    const parts = value.split(/\s+/);

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();
}

function EmptyReport({
    title,
    message,
}: {
    title: string;
    message: string;
}) {
    return (
        <div className="reports-empty-state">
            <div className="reports-empty-icon">
                <FileBarChart2 size={22} />
            </div>

            <div>
                <strong>{title}</strong>
                <p>{message}</p>
            </div>
        </div>
    );
}

function ProgressBar({
    value,
}: {
    value: number;
}) {
    const percentage = Math.min(
        100,
        Math.max(
            0,
            Number.isFinite(value) ? value : 0
        )
    );

    return (
        <div className="reports-progress">
            <div
                className="reports-progress-fill"
                style={{
                    width: `${percentage}%`,
                }}
            />
        </div>
    );
}

function SectionHeading({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <div className="reports-section-heading">
            <div>
                <h2>{title}</h2>

                {description && (
                    <p>{description}</p>
                )}
            </div>
        </div>
    );
}

function MetricRow({
    label,
    value,
    total,
    description,
}: {
    label: string;
    value: number;
    total: number;
    description: string;
}) {
    const percentage =
        total > 0
            ? (value / total) * 100
            : 0;

    return (
        <tr>
            <td>
                <div className="reports-metric-label">
                    <strong>{label}</strong>

                    <span>
                        {description}
                    </span>
                </div>
            </td>

            <td className="reports-number-cell">
                {formatNumber(value)}
            </td>

            <td>
                <div className="reports-share">
                    <div className="reports-share-top">
                        {formatPercentage(
                            percentage
                        )}
                    </div>

                    <ProgressBar
                        value={percentage}
                    />
                </div>
            </td>
        </tr>
    );
}

const WorkItemsReport: React.FC<{
    data: WorkItemSummary | null;
}> = ({ data }) => {
    if (!data) {
        return (
            <EmptyReport
                title="No work-item data"
                message="There is no work-item information available for this workspace."
            />
        );
    }

    const completionRate =
        data.total > 0
            ? (data.completed / data.total) * 100
            : 0;

    const assignmentRate =
        data.total > 0
            ? (data.assigned / data.total) * 100
            : 0;

    const attentionRequired =
        data.blocked +
        data.overdue +
        data.unassigned;

    return (
        <div className="reports-report-body">
            <div className="reports-report-intro">
                <div>
                    <span className="reports-overline">
                        OPERATIONAL ANALYSIS
                    </span>

                    <h3>
                        Workload and delivery overview
                    </h3>

                    <p>
                        Review how work is distributed,
                        completed and currently at risk.
                    </p>
                </div>

                <div className="reports-highlight">
                    <span>
                        Completion rate
                    </span>

                    <strong>
                        {formatPercentage(
                            completionRate
                        )}
                    </strong>
                </div>
            </div>

            <div className="reports-analysis-grid">
                <div className="reports-analysis-item">
                    <span>Total workload</span>

                    <strong>
                        {formatNumber(data.total)}
                    </strong>

                    <small>
                        All work items
                    </small>
                </div>

                <div className="reports-analysis-item">
                    <span>Assigned</span>

                    <strong>
                        {formatNumber(data.assigned)}
                    </strong>

                    <small>
                        {formatPercentage(
                            assignmentRate
                        )}{" "}
                        have an owner
                    </small>
                </div>

                <div className="reports-analysis-item">
                    <span>Completed</span>

                    <strong>
                        {formatNumber(data.completed)}
                    </strong>

                    <small>
                        Successfully delivered
                    </small>
                </div>

                <div className="reports-analysis-item reports-analysis-warning">
                    <span>
                        Attention required
                    </span>

                    <strong>
                        {formatNumber(
                            attentionRequired
                        )}
                    </strong>

                    <small>
                        Blocked, overdue or unassigned
                    </small>
                </div>
            </div>

            <SectionHeading
                title="Workload composition"
                description="Distribution of work items by operational state."
            />

            <div className="reports-table-container">
                <table className="reports-table">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Count</th>
                            <th>Share</th>
                        </tr>
                    </thead>

                    <tbody>
                        <MetricRow
                            label="Assigned"
                            value={data.assigned}
                            total={data.total}
                            description="Work currently owned by a member."
                        />

                        <MetricRow
                            label="Unassigned"
                            value={data.unassigned}
                            total={data.total}
                            description="Work that still requires an owner."
                        />

                        <MetricRow
                            label="Active"
                            value={data.active}
                            total={data.total}
                            description="Currently active work."
                        />

                        <MetricRow
                            label="Completed"
                            value={data.completed}
                            total={data.total}
                            description="Successfully completed work."
                        />

                        <MetricRow
                            label="Blocked"
                            value={data.blocked}
                            total={data.total}
                            description="Work currently blocked."
                        />

                        <MetricRow
                            label="Overdue"
                            value={data.overdue}
                            total={data.total}
                            description="Work beyond its due date."
                        />

                        <MetricRow
                            label="Archived"
                            value={data.archived}
                            total={data.total}
                            description="Archived work items."
                        />
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ProjectsReport: React.FC<{
    data: ProjectSummary[];
}> = ({ data }) => {
    if (!data.length) {
        return (
            <EmptyReport
                title="No projects found"
                message="There are no project records matching the current search."
            />
        );
    }

    return (
        <div className="reports-report-body">
            <div className="reports-report-intro">
                <div>
                    <span className="reports-overline">
                        PROJECT DELIVERY
                    </span>

                    <h3>
                        Project performance
                    </h3>

                    <p>
                        Compare workload and completion
                        across projects.
                    </p>
                </div>

                <div className="reports-inline-count">
                    <strong>
                        {formatNumber(data.length)}
                    </strong>

                    <span>
                        projects
                    </span>
                </div>
            </div>

            <div className="reports-table-container">
                <table className="reports-table reports-wide-table">
                    <thead>
                        <tr>
                            <th>Project</th>
                            <th>Workload</th>
                            <th>Active</th>
                            <th>Completed</th>
                            <th>Blocked</th>
                            <th>Completion</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((project) => (
                            <tr
                                key={
                                    project.projectId
                                }
                            >
                                <td>
                                    <div className="reports-project-name">
                                        <div className="reports-project-icon">
                                            <FileBarChart2
                                                size={15}
                                            />
                                        </div>

                                        <strong>
                                            {
                                                project.projectName
                                            }
                                        </strong>
                                    </div>
                                </td>

                                <td>
                                    <strong>
                                        {formatNumber(
                                            project.total
                                        )}
                                    </strong>
                                </td>

                                <td>
                                    {formatNumber(
                                        project.active
                                    )}
                                </td>

                                <td>
                                    <span className="reports-success-text">
                                        {formatNumber(
                                            project.completed
                                        )}
                                    </span>
                                </td>

                                <td>
                                    <span
                                        className={
                                            project.blocked >
                                            0
                                                ? "reports-danger-text"
                                                : ""
                                        }
                                    >
                                        {formatNumber(
                                            project.blocked
                                        )}
                                    </span>
                                </td>

                                <td>
                                    <div className="reports-project-completion">
                                        <div>
                                            <strong>
                                                {formatPercentage(
                                                    project.completionPercentage
                                                )}
                                            </strong>
                                        </div>

                                        <ProgressBar
                                            value={
                                                project.completionPercentage
                                            }
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AssigneesReport: React.FC<{
    data: AssigneeSummary[];
}> = ({ data }) => {
    if (!data.length) {
        return (
            <EmptyReport
                title="No team data"
                message="There are no assignee records matching the current search."
            />
        );
    }

    return (
        <div className="reports-report-body">
            <div className="reports-report-intro">
                <div>
                    <span className="reports-overline">
                        TEAM ANALYSIS
                    </span>

                    <h3>
                        Team performance
                    </h3>

                    <p>
                        Understand workload ownership
                        and delivery across members.
                    </p>
                </div>

                <div className="reports-inline-count">
                    <strong>
                        {formatNumber(data.length)}
                    </strong>

                    <span>
                        members
                    </span>
                </div>
            </div>

            <div className="reports-table-container">
                <table className="reports-table reports-wide-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Assigned</th>
                            <th>Active</th>
                            <th>Completed</th>
                            <th>Blocked</th>
                            <th>Overdue</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((member) => (
                            <tr
                                key={
                                    member.userId
                                }
                            >
                                <td>
                                    <div className="reports-member">
                                        <div className="reports-avatar">
                                            {getInitials(
                                                member.fullName
                                            )}
                                        </div>

                                        <div>
                                            <strong>
                                                {
                                                    member.fullName
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    member.email
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    <strong>
                                        {formatNumber(
                                            member.assigned
                                        )}
                                    </strong>
                                </td>

                                <td>
                                    {formatNumber(
                                        member.active
                                    )}
                                </td>

                                <td>
                                    <span className="reports-success-text">
                                        {formatNumber(
                                            member.completed
                                        )}
                                    </span>
                                </td>

                                <td>
                                    <span
                                        className={
                                            member.blocked >
                                            0
                                                ? "reports-danger-text"
                                                : ""
                                        }
                                    >
                                        {formatNumber(
                                            member.blocked
                                        )}
                                    </span>
                                </td>

                                <td>
                                    <span
                                        className={
                                            member.overdue >
                                            0
                                                ? "reports-danger-text"
                                                : ""
                                        }
                                    >
                                        {formatNumber(
                                            member.overdue
                                        )}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const LabelsReport: React.FC<{
    data: LabelUsage[];
}> = ({ data }) => {
    if (!data.length) {
        return (
            <EmptyReport
                title="No label data"
                message="There are no labels matching the current search."
            />
        );
    }

    const maxUsage = Math.max(
        ...data.map(
            (item) => item.usageCount
        ),
        1
    );

    const totalUsage = data.reduce(
        (sum, item) =>
            sum + item.usageCount,
        0
    );

    return (
        <div className="reports-report-body">
            <div className="reports-report-intro">
                <div>
                    <span className="reports-overline">
                        CLASSIFICATION
                    </span>

                    <h3>
                        Label usage
                    </h3>

                    <p>
                        Understand which labels are
                        actively used across the workspace.
                    </p>
                </div>

                <div className="reports-inline-count">
                    <strong>
                        {formatNumber(
                            totalUsage
                        )}
                    </strong>

                    <span>
                        total uses
                    </span>
                </div>
            </div>

            <div className="reports-label-list">
                {data.map((label) => {
                    const percentage =
                        totalUsage > 0
                            ? (label.usageCount /
                                  totalUsage) *
                              100
                            : 0;

                    const width =
                        (label.usageCount /
                            maxUsage) *
                        100;

                    return (
                        <div
                            key={label.labelId}
                            className="reports-label-row"
                        >
                            <div className="reports-label-name">
                                <span
                                    className="reports-label-dot"
                                    style={{
                                        background:
                                            label.color ||
                                            "#94a3b8",
                                    }}
                                />

                                <strong>
                                    {label.name}
                                </strong>
                            </div>

                            <div className="reports-label-bar">
                                <div className="reports-label-track">
                                    <div
                                        className="reports-label-fill"
                                        style={{
                                            width: `${width}%`,
                                            background:
                                                label.color ||
                                                "#64748b",
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="reports-label-count">
                                <strong>
                                    {formatNumber(
                                        label.usageCount
                                    )}
                                </strong>

                                <span>
                                    {formatPercentage(
                                        percentage
                                    )}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ProductivityReport: React.FC<{
    data: ProductivityPoint[];
    days: number;
    onDaysChange: (
        value: number
    ) => void;
}> = ({
    data,
    days,
    onDaysChange,
}) => {
    const maxValue = Math.max(
        ...data.flatMap((item) => [
            item.created,
            item.completed,
        ]),
        1
    );

    const totalCreated = data.reduce(
        (sum, item) =>
            sum + item.created,
        0
    );

    const totalCompleted = data.reduce(
        (sum, item) =>
            sum + item.completed,
        0
    );

    const netChange =
        totalCreated -
        totalCompleted;

    return (
        <div className="reports-report-body">
            <div className="reports-report-intro">
                <div>
                    <span className="reports-overline">
                        DELIVERY TREND
                    </span>

                    <h3>
                        Productivity over time
                    </h3>

                    <p>
                        Compare work creation against
                        completed work.
                    </p>
                </div>

                <select
                    className="reports-period-select"
                    value={days}
                    onChange={(event) =>
                        onDaysChange(
                            Number(
                                event.target.value
                            )
                        )
                    }
                >
                    <option value={7}>
                        Last 7 days
                    </option>

                    <option value={14}>
                        Last 14 days
                    </option>

                    <option value={30}>
                        Last 30 days
                    </option>

                    <option value={60}>
                        Last 60 days
                    </option>

                    <option value={90}>
                        Last 90 days
                    </option>
                </select>
            </div>

            {!data.length ? (
                <EmptyReport
                    title="No productivity data"
                    message="There is no productivity activity for the selected period."
                />
            ) : (
                <>
                    <div className="reports-trend-summary">
                        <div>
                            <span>
                                Created
                            </span>

                            <strong>
                                {formatNumber(
                                    totalCreated
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Completed
                            </span>

                            <strong className="reports-success-text">
                                {formatNumber(
                                    totalCompleted
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Net change
                            </span>

                            <strong
                                className={
                                    netChange >
                                    0
                                        ? "reports-warning-text"
                                        : netChange <
                                            0
                                        ? "reports-success-text"
                                        : ""
                                }
                            >
                                {netChange > 0
                                    ? "+"
                                    : ""}
                                {formatNumber(
                                    netChange
                                )}
                            </strong>
                        </div>
                    </div>

                    <div className="reports-trend">
                        <div className="reports-trend-header">
                            <span>
                                Daily activity
                            </span>

                            <div className="reports-legend">
                                <span>
                                    <i className="reports-legend-created" />
                                    Created
                                </span>

                                <span>
                                    <i className="reports-legend-completed" />
                                    Completed
                                </span>
                            </div>
                        </div>

                        <div className="reports-trend-list">
                            {data.map(
                                (item) => {
                                    const createdWidth =
                                        (item.created /
                                            maxValue) *
                                        100;

                                    const completedWidth =
                                        (item.completed /
                                            maxValue) *
                                        100;

                                    return (
                                        <div
                                            className="reports-trend-row"
                                            key={
                                                item.date
                                            }
                                        >
                                            <div className="reports-trend-date">
                                                {formatDate(
                                                    item.date
                                                )}
                                            </div>

                                            <div className="reports-trend-bars">
                                                <div className="reports-trend-line">
                                                    <div
                                                        className="reports-trend-created-bar"
                                                        style={{
                                                            width: `${Math.max(
                                                                item.created >
                                                                    0
                                                                    ? 2
                                                                    : 0,
                                                                createdWidth
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>

                                                <div className="reports-trend-line">
                                                    <div
                                                        className="reports-trend-completed-bar"
                                                        style={{
                                                            width: `${Math.max(
                                                                item.completed >
                                                                    0
                                                                    ? 2
                                                                    : 0,
                                                                completedWidth
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="reports-trend-values">
                                                <span>
                                                    {formatNumber(
                                                        item.created
                                                    )}
                                                </span>

                                                <span>
                                                    {formatNumber(
                                                        item.completed
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const ReportsPage: React.FC = () => {
    const [
        selectedReport,
        setSelectedReport,
    ] = useState<ReportKey>(
        "work-items"
    );

    const [
        workItemSummary,
        setWorkItemSummary,
    ] = useState<WorkItemSummary | null>(
        null
    );

    const [
        projectSummary,
        setProjectSummary,
    ] = useState<ProjectSummary[]>(
        []
    );

    const [
        assigneeSummary,
        setAssigneeSummary,
    ] = useState<AssigneeSummary[]>(
        []
    );

    const [
        labelUsage,
        setLabelUsage,
    ] = useState<LabelUsage[]>(
        []
    );

    const [
        productivity,
        setProductivity,
    ] = useState<ProductivityPoint[]>(
        []
    );

    const [
        days,
        setDays,
    ] = useState(7);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        exporting,
        setExporting,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        lastRefreshed,
        setLastRefreshed,
    ] = useState<Date | null>(
        null
    );

    const activeReport =
        useMemo(
            () =>
                REPORTS.find(
                    (report) =>
                        report.key ===
                        selectedReport
                ) ??
                REPORTS[0],
            [selectedReport]
        );

    const loadReport =
        useCallback(
            async () => {
                setLoading(true);
                setError(null);

                try {
                    switch (
                        selectedReport
                    ) {
                        case "work-items": {
                            const response =
                                await reportsService.getWorkItemSummary();

                            setWorkItemSummary(
                                response
                            );

                            break;
                        }

                        case "projects": {
                            const response =
                                await reportsService.getProjectSummary();

                            setProjectSummary(
                                response
                            );

                            break;
                        }

                        case "assignees": {
                            const response =
                                await reportsService.getAssigneeSummary();

                            setAssigneeSummary(
                                response
                            );

                            break;
                        }

                        case "labels": {
                            const response =
                                await reportsService.getLabelUsage();

                            setLabelUsage(
                                response
                            );

                            break;
                        }

                        case "productivity": {
                            const response =
                                await reportsService.getProductivityTrends(
                                    days
                                );

                            setProductivity(
                                response
                            );

                            break;
                        }
                    }

                    setLastRefreshed(
                        new Date()
                    );
                } catch (err) {
                    console.error(
                        "Reports: failed to load report",
                        err
                    );

                    setError(
                        "Unable to load this report right now. Please try again."
                    );
                } finally {
                    setLoading(false);
                }
            },
            [
                selectedReport,
                days,
            ]
        );

    useEffect(() => {
        void loadReport();
    }, [loadReport]);

    const handleExport =
        async () => {
            setExporting(true);
            setError(null);

            try {
                await reportsService.exportWorkItems();
            } catch (err) {
                console.error(
                    "Reports: export failed",
                    err
                );

                setError(
                    "Unable to export the work-items report."
                );
            } finally {
                setExporting(false);
            }
        };

    const filteredProjects =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return projectSummary;
            }

            return projectSummary.filter(
                (project) =>
                    project.projectName
                        .toLowerCase()
                        .includes(query)
            );
        }, [
            projectSummary,
            search,
        ]);

    const filteredAssignees =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return assigneeSummary;
            }

            return assigneeSummary.filter(
                (member) =>
                    member.fullName
                        .toLowerCase()
                        .includes(query) ||
                    member.email
                        .toLowerCase()
                        .includes(query)
            );
        }, [
            assigneeSummary,
            search,
        ]);

    const filteredLabels =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return labelUsage;
            }

            return labelUsage.filter(
                (label) =>
                    label.name
                        .toLowerCase()
                        .includes(query)
            );
        }, [
            labelUsage,
            search,
        ]);

    const showSearch =
        selectedReport ===
            "projects" ||
        selectedReport ===
            "assignees" ||
        selectedReport ===
            "labels";

    const resultCount =
        selectedReport ===
            "projects"
            ? filteredProjects.length
            : selectedReport ===
                "assignees"
            ? filteredAssignees.length
            : selectedReport ===
                "labels"
            ? filteredLabels.length
            : selectedReport ===
                "productivity"
            ? productivity.length
            : workItemSummary?.total ??
              0;

    const resultLabel =
        selectedReport ===
            "projects"
            ? "projects"
            : selectedReport ===
                "assignees"
            ? "members"
            : selectedReport ===
                "labels"
            ? "labels"
            : selectedReport ===
                "productivity"
            ? "data points"
            : "work items";

    const hasActiveSearch =
        search.trim().length > 0;

    const hasActiveFilter =
        hasActiveSearch ||
        (selectedReport ===
            "productivity" &&
            days !== 7);

    return (
        <div className="reports-page">
            <header className="reports-header">
                <div>
                    <div className="reports-eyebrow">
                        <FileBarChart2
                            size={14}
                        />

                        REPORTING
                    </div>

                    <h1>
                        Reports &amp; Insights
                    </h1>

                    <p>
                        Analyze workload, delivery,
                        team performance and
                        productivity across your
                        workspace.
                    </p>
                </div>

                <div className="reports-header-actions">
                    <button
                        type="button"
                        className="reports-button reports-button-secondary"
                        onClick={() =>
                            void loadReport()
                        }
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2
                                size={15}
                                className="reports-spin"
                            />
                        ) : (
                            <RefreshCw
                                size={15}
                            />
                        )}

                        Refresh
                    </button>

                    <button
                        type="button"
                        className="reports-button reports-button-primary"
                        onClick={() =>
                            void handleExport()
                        }
                        disabled={exporting}
                    >
                        {exporting ? (
                            <Loader2
                                size={15}
                                className="reports-spin"
                            />
                        ) : (
                            <Download
                                size={15}
                            />
                        )}

                        {exporting
                            ? "Preparing..."
                            : "Export Work Items"}
                    </button>
                </div>
            </header>

            {error && (
                <div className="reports-error">
                    <CircleAlert
                        size={16}
                    />

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            void loadReport()
                        }
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="reports-layout">
                <aside className="reports-sidebar">
                    <div className="reports-sidebar-heading">
                        <div>
                            <span>
                                REPORT LIBRARY
                            </span>

                            <strong>
                                {REPORTS.length} reports
                            </strong>
                        </div>
                    </div>

                    <div className="reports-library">
                        {Array.from(
                            new Set(
                                REPORTS.map(
                                    (report) =>
                                        report.category
                                )
                            )
                        ).map(
                            (category) => (
                                <div
                                    className="reports-category"
                                    key={category}
                                >
                                    <div className="reports-category-title">
                                        {category}
                                    </div>

                                    {REPORTS.filter(
                                        (report) =>
                                            report.category ===
                                            category
                                    ).map(
                                        (
                                            report
                                        ) => {
                                            const active =
                                                report.key ===
                                                selectedReport;

                                            return (
                                                <button
                                                    type="button"
                                                    key={
                                                        report.key
                                                    }
                                                    className={`reports-library-item ${
                                                        active
                                                            ? "reports-library-item-active"
                                                            : ""
                                                    }`}
                                                    onClick={() => {
                                                        setSelectedReport(
                                                            report.key
                                                        );

                                                        setSearch(
                                                            ""
                                                        );

                                                        setError(
                                                            null
                                                        );
                                                    }}
                                                >
                                                    <span className="reports-library-icon">
                                                        {
                                                            report.icon
                                                        }
                                                    </span>

                                                    <span className="reports-library-content">
                                                        <strong>
                                                            {
                                                                report.title
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                report.description
                                                            }
                                                        </small>
                                                    </span>

                                                    <ChevronRight
                                                        size={14}
                                                        className="reports-library-arrow"
                                                    />
                                                </button>
                                            );
                                        }
                                    )}
                                </div>
                            )
                        )}
                    </div>

                    <div className="reports-sidebar-footer">
                        <div>
                            <CheckCircle2
                                size={14}
                            />

                            <span>
                                Live workspace data
                            </span>
                        </div>

                        <small>
                            Refresh reports whenever
                            you need the latest
                            information.
                        </small>
                    </div>
                </aside>

                <main className="reports-workspace">
                    <div className="reports-workspace-header">
                        <div className="reports-workspace-title">
                            <div className="reports-workspace-icon">
                                {
                                    activeReport.icon
                                }
                            </div>

                            <div>
                                <span>
                                    {
                                        activeReport.category
                                    }
                                </span>

                                <h2>
                                    {
                                        activeReport.title
                                    }
                                </h2>

                                <p>
                                    {
                                        activeReport.description
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="reports-workspace-tools">
                            {showSearch && (
                                <div className="reports-search">
                                    <Search
                                        size={15}
                                    />

                                    <input
                                        value={
                                            search
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSearch(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder={
                                            selectedReport ===
                                            "projects"
                                                ? "Search projects..."
                                                : selectedReport ===
                                                    "assignees"
                                                ? "Search members..."
                                                : "Search labels..."
                                        }
                                    />

                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSearch(
                                                    ""
                                                )
                                            }
                                            aria-label="Clear search"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            )}

                            {selectedReport ===
                                "productivity" && (
                                <select
                                    className="reports-period-select"
                                    value={days}
                                    onChange={(
                                        event
                                    ) =>
                                        setDays(
                                            Number(
                                                event
                                                    .target
                                                    .value
                                            )
                                        )
                                    }
                                >
                                    <option value={7}>
                                        7 days
                                    </option>

                                    <option value={14}>
                                        14 days
                                    </option>

                                    <option value={30}>
                                        30 days
                                    </option>

                                    <option value={60}>
                                        60 days
                                    </option>

                                    <option value={90}>
                                        90 days
                                    </option>
                                </select>
                            )}

                            {hasActiveFilter && (
                                <button
                                    type="button"
                                    className="reports-clear-button"
                                    onClick={() => {
                                        setSearch(
                                            ""
                                        );
                                        setDays(
                                            7
                                        );
                                    }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="reports-context">
                        <div className="reports-context-left">
                            <span>
                                {selectedReport ===
                                "productivity"
                                    ? `Last ${days} days`
                                    : "Current workspace data"}
                            </span>

                            {hasActiveSearch && (
                                <span className="reports-context-filter">
                                    Search: "{search}"
                                </span>
                            )}
                        </div>

                        <div className="reports-context-right">
                            <span>
                                {formatNumber(
                                    resultCount
                                )}{" "}
                                {resultLabel}
                            </span>

                            {lastRefreshed && (
                                <>
                                    <span className="reports-context-separator">
                                        •
                                    </span>

                                    <span>
                                        Updated{" "}
                                        {lastRefreshed.toLocaleTimeString(
                                            [],
                                            {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }
                                        )}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="reports-workspace-divider" />

                    {loading ? (
                        <div className="reports-loading">
                            <Loader2
                                size={22}
                                className="reports-spin"
                            />

                            <span>
                                Preparing report...
                            </span>
                        </div>
                    ) : (
                        <>
                            {selectedReport ===
                                "work-items" && (
                                <WorkItemsReport
                                    data={
                                        workItemSummary
                                    }
                                />
                            )}

                            {selectedReport ===
                                "projects" && (
                                <ProjectsReport
                                    data={
                                        filteredProjects
                                    }
                                />
                            )}

                            {selectedReport ===
                                "assignees" && (
                                <AssigneesReport
                                    data={
                                        filteredAssignees
                                    }
                                />
                            )}

                            {selectedReport ===
                                "labels" && (
                                <LabelsReport
                                    data={
                                        filteredLabels
                                    }
                                />
                            )}

                            {selectedReport ===
                                "productivity" && (
                                <ProductivityReport
                                    data={
                                        productivity
                                    }
                                    days={days}
                                    onDaysChange={
                                        setDays
                                    }
                                />
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ReportsPage;