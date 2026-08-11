import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    reorderChecklists,
} from "../api/checklist.service";

import type {
    ReorderChecklistRequest,
} from "../types/checklist";

type ReorderChecklistMutation = {
    workItemId: string;
    data: ReorderChecklistRequest;
};

export function useReorderChecklists() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            data,
        }: ReorderChecklistMutation) =>
            reorderChecklists(data),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "checklists",
                    variables.workItemId,
                ],
            });
        },

        onError: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "checklists",
                    variables.workItemId,
                ],
            });
        },
    });
}
