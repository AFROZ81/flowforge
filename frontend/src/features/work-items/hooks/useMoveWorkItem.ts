import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    moveWorkItem,
    type MoveWorkItemRequest,
} from "../api/workItem.service";

type MoveWorkItemMutation = {
    id: string;
    data: MoveWorkItemRequest;
};

export function useMoveWorkItem() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: MoveWorkItemMutation) =>
            moveWorkItem(id, data),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "work-item",
                    variables.id,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "board-details",
                ],
            });
        },

        onError: () => {
            /*
             * Force the board to reload from
             * the server after a failed move.
             *
             * This prevents the optimistic UI
             * from remaining out of sync.
             */
            queryClient.invalidateQueries({
                queryKey: [
                    "board-details",
                ],
            });
        },
    });
}