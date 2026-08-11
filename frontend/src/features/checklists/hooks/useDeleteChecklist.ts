import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    deleteChecklist,
} from "../api/checklist.service";

type DeleteChecklistMutation = {
    workItemId: string;
    checklistItemId: string;
};

export function useDeleteChecklist() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            checklistItemId,
        }: DeleteChecklistMutation) =>
            deleteChecklist(
                checklistItemId
            ),

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
