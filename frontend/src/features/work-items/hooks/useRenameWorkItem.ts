import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    renameWorkItem,
    type RenameWorkItemRequest,
} from "../api/workItem.service";

type RenameWorkItemMutation = {
    id: string;
    data: RenameWorkItemRequest;
};

export function useRenameWorkItem() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: RenameWorkItemMutation) =>
            renameWorkItem(id, data),

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