import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    createWorkItem,
} from "../api/workItem.service";

export function useCreateWorkItem() {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn:
            createWorkItem,

        onSuccess: (_, variables) => {

            queryClient.invalidateQueries({
                queryKey: [
                    "work-items",
                    variables.boardId,
                ],
            });

        },
    });
}