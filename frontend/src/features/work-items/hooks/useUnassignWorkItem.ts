import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    unassignWorkItem,
} from "../api/workItem.service";

export function useUnassignWorkItem() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            workItemId: string
        ) =>
            unassignWorkItem(
                workItemId
            ),

        onSuccess: (
            _data,
            workItemId
        ) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "work-item",
                    workItemId,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "board-details",
                ],
            });
        },
    });
}