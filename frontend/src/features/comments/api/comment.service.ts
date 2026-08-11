import api from "@/lib/api";

import type {
    Comment,
    CreateCommentRequest,
    UpdateCommentRequest,
} from "../types/comment";

export const getCommentsByWorkItem =
    async (
        workItemId: string
    ): Promise<Comment[]> => {
        const response =
            await api.get(
                `/Comments/workitem/${workItemId}`
            );

        return response.data.data;
    };

export const getComment = async (
    id: string
): Promise<Comment> => {
    const response =
        await api.get(
            `/Comments/${id}`
        );

    return response.data.data;
};

export const createComment = async (
    data: CreateCommentRequest
): Promise<Comment> => {
    const response =
        await api.post(
            "/Comments",
            data
        );

    return response.data.data;
};

export const updateComment = async (
    id: string,
    data: UpdateCommentRequest
): Promise<Comment> => {
    const response =
        await api.patch(
            `/Comments/${id}/update`,
            data
        );

    return response.data.data;
};

export const deleteComment = async (
    id: string
) => {
    const response =
        await api.delete(
            `/Comments/${id}`
        );

    return response.data.data;
};