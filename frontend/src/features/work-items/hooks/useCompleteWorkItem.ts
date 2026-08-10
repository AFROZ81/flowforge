import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    completeWorkItem,
} from "../api/workItem.service";

export function useCompleteWorkItem() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: completeWorkItem,

        onSuccess: (
            _data,
            workItemId
        ) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "work-item",
                    workItemId,
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