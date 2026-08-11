import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    completeChecklist,
} from "../api/checklist.service";

type CompleteChecklistMutation = {
    workItemId: string;
    checklistItemId: string;
};

export function useCompleteChecklist() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            checklistItemId,
        }: CompleteChecklistMutation) =>
            completeChecklist(
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
