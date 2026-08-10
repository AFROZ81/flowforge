import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    blockWorkItem,
} from "../api/workItem.service";

export function useBlockWorkItem() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: blockWorkItem,

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