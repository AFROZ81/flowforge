import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    createComment,
} from "../api/comment.service";

import type {
    CreateCommentRequest,
} from "../types/comment";

export function useCreateComment() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            (
                data: CreateCommentRequest
            ) =>
                createComment(data),

        onSuccess: (
            _data,
            variables
        ) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "comments",
                    variables.workItemId,
                ],
            });
        },
    });
}