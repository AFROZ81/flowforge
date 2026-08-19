import { useQuery } from "@tanstack/react-query";

import { dashboardService } from "../api/dashboard.service";


export function useProjectProgress() {

    return useQuery({

        queryKey: [
            "dashboard-project-progress",
        ],

        queryFn:
            dashboardService.getProjectProgress,

    });

}