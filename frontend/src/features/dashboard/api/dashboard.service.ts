import api from "@/lib/api";

import type {
    ApiResponse,
    DashboardOverview,
} from "../types/dashboard.types";

import type {
    WorkItemDistributionResponse,
} from "../types/distribution.types";

export const dashboardService = {
    async getOverview() {
        const response =
            await api.get<ApiResponse<DashboardOverview>>(
                "/Dashboard/overview"
            );

        return response.data;
    },

    async getWorkItemDistribution() {
        const response =
            await api.get<ApiResponse<WorkItemDistributionResponse>>(
                "/Dashboard/work-item-distribution"
            );

        return response.data;
    },
};