import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    updateChecklist,
} from "../api/checklist.service";

import type {
    UpdateChecklistRequest,
} from "../types/checklist";

type UpdateChecklistMutation = {
    workItemId: string;
    data: UpdateChecklistRequest;
};

export function useUpdateChecklist() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            data,
        }: UpdateChecklistMutation) =>
            updateChecklist(data),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "checklists",
                    variables.workItemId,
                ],
            });
        },
    });
}
