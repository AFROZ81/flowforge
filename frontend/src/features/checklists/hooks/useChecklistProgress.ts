import { useQuery } from "@tanstack/react-query";

import {
    getChecklistProgress,
} from "../api/checklist.service";

export function useChecklistProgress(
    workItemId: string
) {
    return useQuery({
        queryKey: [
            "checklist-progress",
            workItemId,
        ],

        queryFn: () =>
            getChecklistProgress(
                workItemId
            ),

        enabled: !!workItemId,
    });
}
