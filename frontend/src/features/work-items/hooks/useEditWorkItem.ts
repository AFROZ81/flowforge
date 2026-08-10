import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    editWorkItem,
    type EditWorkItemRequest,
} from "../api/workItem.service";

type EditWorkItemMutation = {
    id: string;
    data: EditWorkItemRequest;
};

export function useEditWorkItem() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: EditWorkItemMutation) =>
            editWorkItem(id, data),

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
    });
}