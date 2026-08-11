import { useQuery } from "@tanstack/react-query";

import {
    getCommentsByWorkItem,
} from "../api/comment.service";

import type {
    Comment,
} from "../types/comment";

export function useComments(
    workItemId: string
) {
    return useQuery<Comment[]>({
        queryKey: [
            "comments",
            workItemId,
        ],

        queryFn: () =>
            getCommentsByWorkItem(
                workItemId
            ),

        enabled:
            !!workItemId,
    });
}