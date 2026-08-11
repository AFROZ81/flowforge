import { useQuery } from "@tanstack/react-query";

import { getChecklists } from "../api/checklist.service";

export function useChecklists(
    workItemId: string
) {
    return useQuery({
        queryKey: [
            "checklists",
            workItemId,
        ],

        queryFn: () =>
            getChecklists(workItemId),

        enabled: !!workItemId,
    });
}
