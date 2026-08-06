import { useQuery } from "@tanstack/react-query";

import { dashboardService } from "../api/dashboard.service";

export function useWorkItemDistribution() {
    return useQuery({
        queryKey: ["work-item-distribution"],
        queryFn: dashboardService.getWorkItemDistribution,
    });
}