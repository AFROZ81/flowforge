import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    deleteComment,
} from "../api/comment.service";

type DeleteCommentVariables = {
    id: string;
    workItemId: string;
};

export function useDeleteComment() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            variables: DeleteCommentVariables
        ) =>
            deleteComment(
                variables.id
            ),

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