import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    uncompleteChecklist,
} from "../api/checklist.service";

type UncompleteChecklistMutation = {
    workItemId: string;
    checklistItemId: string;
};

export function useUncompleteChecklist() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            checklistItemId,
        }: UncompleteChecklistMutation) =>
            uncompleteChecklist(
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
