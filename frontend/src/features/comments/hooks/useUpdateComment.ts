import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    updateComment,
} from "../api/comment.service";

type UpdateCommentVariables = {
    id: string;
    workItemId: string;
    content: string;
};

export function useUpdateComment() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            variables: UpdateCommentVariables
        ) =>
            updateComment(
                variables.id,
                {
                    commentId:
                        variables.id,

                    content:
                        variables.content,
                }
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