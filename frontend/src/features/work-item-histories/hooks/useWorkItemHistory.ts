import { useQuery } from "@tanstack/react-query";

import {
    getWorkItemHistory,
} from "../api/workItemHistory.service";

export function useWorkItemHistory(
    workItemId: string
) {
    return useQuery({
        queryKey: [
            "work-item-history",
            workItemId,
        ],

        queryFn: () =>
            getWorkItemHistory(
                workItemId
            ),

        enabled:
            !!workItemId,
    });
}