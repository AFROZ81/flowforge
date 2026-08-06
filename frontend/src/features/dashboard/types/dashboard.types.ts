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

export interface ApiResponse<T> {
    succeeded: boolean;
    message: string;
    data: T;
}