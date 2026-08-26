export interface WorkItemSummary {
    total: number;
    active: number;
    blocked: number;
    completed: number;
    archived: number;
    assigned: number;
    unassigned: number;
    overdue: number;
}

export interface ProjectSummary {
    projectId: string;
    projectName: string;
    total: number;
    active: number;
    completed: number;
    blocked: number;
    completionPercentage: number;
}

export interface AssigneeSummary {
    userId: string;
    fullName: string;
    email: string;
    assigned: number;
    active: number;
    completed: number;
    blocked: number;
    overdue: number;
}

export interface LabelUsage {
    labelId: string;
    name: string;
    color: string;
    usageCount: number;
}

export interface ProductivityTrend {
    date: string;
    created: number;
    completed: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    traceId?: string | null;
    errors?: unknown;
}