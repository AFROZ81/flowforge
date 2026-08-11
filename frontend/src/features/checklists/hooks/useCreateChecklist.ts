import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    createChecklist,
} from "../api/checklist.service";

import type {
    CreateChecklistRequest,
} from "../types/checklist";

export function useCreateChecklist() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            data: CreateChecklistRequest
        ) =>
            createChecklist(data),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "checklists",
                    variables.workItemId,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "checklist-progress",
                    variables.workItemId,
                ],
            });
        },
    });
}
