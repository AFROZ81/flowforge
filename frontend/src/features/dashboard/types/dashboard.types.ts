export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    traceId?: string | null;
    errors?: string[] | null;
}


/* =========================================================
   DASHBOARD OVERVIEW
   ========================================================= */

export interface DashboardOverview {
    totalProjects: number;
    totalBoards: number;
    totalWorkItems: number;

    activeWorkItems: number;
    completedWorkItems: number;
    blockedWorkItems: number;
    overdueWorkItems: number;

    completionPercentage: number;
}


/* =========================================================
   PROJECT PROGRESS
   ========================================================= */

export interface ProjectProgressItem {
    projectId: string;
    projectName: string;
    projectKey: string;
    color: string;

    totalWorkItems: number;
    activeWorkItems: number;
    completedWorkItems: number;
    blockedWorkItems: number;
    overdueWorkItems: number;

    completionPercentage: number;
}


/* =========================================================
   DUE WORK ITEMS
   ========================================================= */

export interface DueWorkItem {
    workItemId: string;
    title: string;
    status: string;
    priority: string;

    dueDate: string;

    projectId: string;
    projectName: string;
    projectKey: string;

    boardId: string;
    boardName: string;

    columnId: string;
    columnName: string;
}


export interface DueWorkItemsResponse {
    overdue: DueWorkItem[];
    upcoming: DueWorkItem[];
}


/* =========================================================
   RECENT WORK ITEMS
   ========================================================= */

export interface RecentWorkItem {
    workItemId: string;
    title: string;
    status: string;
    priority: string;

    dueDate: string | null;

    projectId: string;
    projectName: string;
    projectKey: string;

    boardId: string;
    boardName: string;

    columnId: string;
    columnName: string;

    lastActivityAt: string;
}


/* =========================================================
   WORK ITEM TREND
   ========================================================= */

export interface WorkItemTrendItem {
    date: string;
    created: number;
    completed: number;
}