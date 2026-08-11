import { useQuery } from "@tanstack/react-query";

import {
    getWorkItemWatchers,
} from "../api/workItemWatcher.service";

export function useWorkItemWatchers(
    workItemId: string
) {
    return useQuery({
        queryKey: [
            "work-item-watchers",
            workItemId,
        ],

        queryFn: () =>
            getWorkItemWatchers(
                workItemId
            ),

        enabled: !!workItemId,
    });
}