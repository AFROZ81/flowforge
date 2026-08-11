export type Comment = {
    id: string;
    workItemId: string;
    authorId: string;
    content: string;

    createdAt?: string;
    updatedAt?: string | null;
    isEdited?: boolean;
    editedAt?: string | null;
};

export type CreateCommentRequest = {
    workItemId: string;
    content: string;
};

export type UpdateCommentRequest = {
    commentId: string;
    content: string;
};