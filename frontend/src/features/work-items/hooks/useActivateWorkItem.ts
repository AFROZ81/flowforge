import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    activateWorkItem,
} from "../api/workItem.service";

export function useActivateWorkItem() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: activateWorkItem,

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