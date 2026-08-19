import api from "@/lib/api";

import type {
    ApiResponse,
    DashboardOverview,
    ProjectProgressItem,
    DueWorkItemsResponse,
    RecentWorkItem,
    WorkItemTrendItem,
} from "../types/dashboard.types";

import type {
    WorkItemDistributionResponse,
} from "../types/distribution.types";


export const dashboardService = {

    /* =====================================================
       OVERVIEW
       ===================================================== */

    async getOverview() {

        const response =
            await api.get<
                ApiResponse<DashboardOverview>
            >(
                "/Dashboard/overview"
            );

        return response.data;
    },


    /* =====================================================
       WORK ITEM DISTRIBUTION
       ===================================================== */

    async getWorkItemDistribution() {

        const response =
            await api.get<
                ApiResponse<WorkItemDistributionResponse>
            >(
                "/Dashboard/work-item-distribution"
            );

        return response.data;
    },


    /* =====================================================
       PROJECT PROGRESS
       ===================================================== */

    async getProjectProgress() {

        const response =
            await api.get<
                ApiResponse<ProjectProgressItem[]>
            >(
                "/Dashboard/project-progress"
            );

        return response.data;
    },


    /* =====================================================
       DUE WORK ITEMS
       ===================================================== */

    async getDueWorkItems() {

        const response =
            await api.get<
                ApiResponse<DueWorkItemsResponse>
            >(
                "/Dashboard/due-work-items"
            );

        return response.data;
    },


    /* =====================================================
       RECENT WORK ITEMS
       ===================================================== */

    async getRecentWorkItems() {

        const response =
            await api.get<
                ApiResponse<RecentWorkItem[]>
            >(
                "/Dashboard/recent-work-items"
            );

        return response.data;
    },


    /* =====================================================
       WORK ITEM TREND
       ===================================================== */

    async getWorkItemTrend(
        days: number = 7
    ) {

        const response =
            await api.get<
                ApiResponse<WorkItemTrendItem[]>
            >(
                "/Dashboard/work-item-trend",
                {
                    params: {
                        days,
                    },
                }
            );

        return response.data;
    },

};