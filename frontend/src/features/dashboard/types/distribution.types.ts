export interface DashboardDistributionItem {
    name: string;
    count: number;
    percentage: number;
}

export interface WorkItemDistributionResponse {
    byStatus: DashboardDistributionItem[];
    byPriority: DashboardDistributionItem[];
}