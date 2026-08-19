import { useQuery } from "@tanstack/react-query";

import { dashboardService } from "../api/dashboard.service";


export function useRecentWorkItems() {

    return useQuery({

        queryKey: [
            "dashboard-recent-work-items",
        ],

        queryFn:
            dashboardService.getRecentWorkItems,

    });

}