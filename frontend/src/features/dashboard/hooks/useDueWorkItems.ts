import { useQuery } from "@tanstack/react-query";

import { dashboardService } from "../api/dashboard.service";


export function useDueWorkItems() {

    return useQuery({

        queryKey: [
            "dashboard-due-work-items",
        ],

        queryFn:
            dashboardService.getDueWorkItems,

    });

}