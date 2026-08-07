import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    createBoard,
    type CreateBoardRequest,
} from "../api/board.service";

export function useCreateBoard() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            data: CreateBoardRequest
        ) => createBoard(data),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "boards",
                    variables.projectId,
                ],
            });
        },
    });
}