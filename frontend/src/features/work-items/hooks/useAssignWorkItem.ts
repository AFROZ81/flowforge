import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    assignWorkItem,
} from "../api/workItem.service";

type AssignWorkItemRequest = {
    workItemId: string;
    userId: string;
};

export function useAssignWorkItem() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            workItemId,
            userId,
        }: AssignWorkItemRequest) =>
            assignWorkItem(
                workItemId,
                userId
            ),

        onSuccess: (
            _data,
            variables
        ) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "work-item",
                    variables.workItemId,
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