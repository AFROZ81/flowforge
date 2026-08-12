import { useQuery } from "@tanstack/react-query";

import {
    getWorkItemLabels,
} from "../api/label.service";

export function useWorkItemLabels(
    workItemId: string
) {
    return useQuery({
        queryKey: [
            "work-item-labels",
            workItemId,
        ],

        queryFn: () =>
            getWorkItemLabels(
                workItemId
            ),

        enabled:
            !!workItemId,
    });
}