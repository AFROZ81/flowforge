import { useQuery } from "@tanstack/react-query";

import { getWorkItemsByColumn } from "../api/workItem.service";

export function useArchivedWorkItems(
    columnId: string
) {
    return useQuery({
        queryKey: [
            "archived-work-items",
            columnId,
        ],

        queryFn: () =>
            getWorkItemsByColumn(
                columnId,
                true
            ),

        enabled: !!columnId,
    });
}