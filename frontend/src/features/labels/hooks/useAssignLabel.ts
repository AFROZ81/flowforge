import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    assignLabelToWorkItem,
} from "../api/label.service";

type AssignLabelMutation = {
    workItemId: string;
    labelId: string;
};

export function useAssignLabel() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            workItemId,
            labelId,
        }: AssignLabelMutation) =>
            assignLabelToWorkItem(
                workItemId,
                labelId
            ),

        onSuccess: (
            _,
            variables
        ) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "work-item-labels",
                    variables.workItemId,
                ],
            });
        },
    });
}