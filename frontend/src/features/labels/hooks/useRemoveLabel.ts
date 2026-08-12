import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    removeLabelFromWorkItem,
} from "../api/label.service";

type RemoveLabelMutation = {
    workItemId: string;
    labelId: string;
};

export function useRemoveLabel() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            workItemId,
            labelId,
        }: RemoveLabelMutation) =>
            removeLabelFromWorkItem(
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