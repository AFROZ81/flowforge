import { useQuery } from "@tanstack/react-query";

import { dashboardService } from "../api/dashboard.service";

export function useDashboardOverview() {
    return useQuery({
        queryKey: ["dashboard-overview"],
        queryFn: dashboardService.getOverview,
    });
}