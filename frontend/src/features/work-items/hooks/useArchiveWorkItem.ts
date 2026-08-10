import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { archiveWorkItem } from "../api/workItem.service";

export function useArchiveWorkItem() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            id: string
        ) => archiveWorkItem(id),

        onSuccess: (_, id) => {
            // Refresh the individual work item.
            queryClient.invalidateQueries({
                queryKey: [
                    "work-item",
                    id,
                ],
            });

            // Refresh the board.
            queryClient.invalidateQueries({
                queryKey: [
                    "board-details",
                ],
            });

            // Refresh all archived-work-item
            // queries for all columns.
            queryClient.invalidateQueries({
                queryKey: [
                    "archived-work-items",
                ],
            });
        },
    });
}