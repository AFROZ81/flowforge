import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { restoreWorkItem } from "../api/workItem.service";

export function useRestoreWorkItem() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            id: string
        ) => restoreWorkItem(id),

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

            // Refresh archived sections.
            queryClient.invalidateQueries({
                queryKey: [
                    "archived-work-items",
                ],
            });
        },
    });
}