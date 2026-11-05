/**
 * Mirrors DashboardSnapshot from
 * FlowForge.Application.Features.Dashboard.GetSnapshot, one field per field.
 *
 * Status and priority arrive as strings: the API renders them the way the board
 * does, so the page never has to keep an enum table in step with the backend.
 */

export type WorkItemBrief = {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    projectId: string;
    projectName: string;
    projectKey: string;
    boardId: string;
    boardName: string;
    /** Filled only for the recently-updated list. */
    lastActivityAt: string | null;
};

/** Counts over the signed-in user's own open work. */
export type MyWorkSummary = {
    open: number;
    overdue: number;
    dueSoon: number;
    blocked: number;
};

export type ProjectHealth = {
    projectId: string;
    projectName: string;
    projectKey: string;
    color: string;
    /** The emoji chosen at creation; the mark falls back to the key without it. */
    icon: string | null;
    total: number;
    completed: number;
    blocked: number;
    overdue: number;
    completionPercentage: number;
};

export type WorkloadMember = {
    userId: string;
    fullName: string;
    assigned: number;
    active: number;
    completed: number;
    blocked: number;
    overdue: number;
};

export type StatusMix = {
    total: number;
    active: number;
    completed: number;
    blocked: number;
    overdue: number;
};

/**
 * Workspace-wide and over open work only - a completed item's urgency is
 * history, so it is not in any of these four buckets.
 */
export type PriorityMix = {
    total: number;
    low: number;
    medium: number;
    high: number;
    critical: number;
};

/** `date` is a server-side DateOnly: a plain "YYYY-MM-DD", no instant attached. */
export type TrendPoint = {
    date: string;
    created: number;
    completed: number;
};

export type DashboardSnapshot = {
    myWork: MyWorkSummary;
    myOpenItems: WorkItemBrief[];
    projectHealth: ProjectHealth[];
    projectCount: number;
    teamWorkload: WorkloadMember[];
    statusMix: StatusMix;
    priorityMix: PriorityMix;
    throughput: TrendPoint[];
    recentlyUpdated: WorkItemBrief[];
    generatedAtUtc: string;
};
