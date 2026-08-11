import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
    useComments,
} from "../hooks/useComments";

import {
    useCreateComment,
} from "../hooks/useCreateComment";

import CommentItem from "./CommentItem";

import type {
    OrganizationUser,
} from "@/features/work-items/types/user";

type Props = {
    workItemId: string;
    users: OrganizationUser[];
    disabled?: boolean;
};

export default function CommentsSection({
    workItemId,
    users,
    disabled = false,
}: Props) {
    const [content, setContent] =
        useState("");

    const {
        data: comments = [],
        isLoading,
        isError,
    } = useComments(
        workItemId
    );

    const createMutation =
        useCreateComment();

    const handleCreate =
        async () => {
            const trimmed =
                content.trim();

            if (!trimmed) {
                toast.error(
                    "Comment cannot be empty."
                );

                return;
            }

            try {
                await createMutation.mutateAsync(
                    {
                        workItemId,

                        content:
                            trimmed,
                    }
                );

                setContent("");

                toast.success(
                    "Comment added."
                );
            } catch (error) {
                console.error(
                    "Failed to create comment:",
                    error
                );

                toast.error(
                    "Failed to add comment."
                );
            }
        };

    return (
        <div className="space-y-4">

            {/* Header */}

            <div className="
                flex
                items-center
                justify-between
            ">

                <div className="
                    flex
                    items-center
                    gap-2
                ">

                    <MessageSquare className="
                        h-4
                        w-4
                        text-muted-foreground
                    " />

                    <h3 className="
                        text-sm
                        font-semibold
                    ">
                        Comments
                    </h3>

                    <span className="
                        rounded-full
                        bg-muted
                        px-2
                        py-0.5
                        text-xs
                        text-muted-foreground
                    ">
                        {comments.length}
                    </span>

                </div>

            </div>

            {/* Comments */}

            {isLoading && (
                <div className="
                    rounded-lg
                    border
                    p-4
                    text-center
                    text-sm
                    text-muted-foreground
                ">
                    Loading comments...
                </div>
            )}

            {isError && (
                <div className="
                    rounded-lg
                    border
                    border-red-200
                    bg-red-50
                    p-4
                    text-sm
                    text-red-600
                ">
                    Failed to load comments.
                </div>
            )}

            {!isLoading &&
                !isError &&
                comments.length ===
                    0 && (
                    <div className="
                        rounded-lg
                        border
                        border-dashed
                        p-5
                        text-center
                        text-sm
                        text-muted-foreground
                    ">
                        No comments yet.
                    </div>
                )}

            {!isLoading &&
                !isError &&
                comments.length >
                    0 && (
                    <div className="space-y-3">

                        {comments.map(
                            (comment) => (
                                <CommentItem
                                    key={
                                        comment.id
                                    }
                                    comment={
                                        comment
                                    }
                                    users={
                                        users
                                    }
                                />
                            )
                        )}

                    </div>
                )}

            {/* Add Comment */}

            <div className="
                space-y-2
                rounded-xl
                border
                bg-muted/20
                p-3
            ">

                <Textarea
                    placeholder="Write a comment..."
                    value={content}
                    onChange={(
                        event
                    ) =>
                        setContent(
                            event
                                .target
                                .value
                        )
                    }
                    rows={3}
                    disabled={
                        disabled ||
                        createMutation.isPending
                    }
                />

                <div className="
                    flex
                    justify-end
                ">

                    <Button
                        type="button"
                        size="sm"
                        onClick={
                            handleCreate
                        }
                        disabled={
                            disabled ||
                            createMutation.isPending ||
                            !content.trim()
                        }
                    >
                        {createMutation.isPending
                            ? "Adding..."
                            : "Add Comment"}
                    </Button>

                </div>

            </div>

        </div>
    );
}