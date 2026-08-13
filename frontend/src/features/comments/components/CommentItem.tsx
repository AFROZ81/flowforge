import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
    useUpdateComment,
} from "../hooks/useUpdateComment";

import {
    useDeleteComment,
} from "../hooks/useDeleteComment";

import type {
    Comment,
} from "../types/comment";

import type {
    OrganizationUser,
} from "@/features/work-items/types/user";

import OnlineIndicator from "@/features/presence/components/OnlineIndicator";

type Props = {
    comment: Comment;
    users: OrganizationUser[];
};

function formatDate(
    value?: string
) {
    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    return date.toLocaleString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}

export default function CommentItem({
    comment,
    users,
}: Props) {
    const [editing, setEditing] =
        useState(false);

    const [content, setContent] =
        useState(
            comment.content
        );

    const updateMutation =
        useUpdateComment();

    const deleteMutation =
        useDeleteComment();

    const author =
        users.find(
            (user) =>
                user.id ===
                comment.authorId
        );

    const handleUpdate =
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
                await updateMutation.mutateAsync(
                    {
                        id:
                            comment.id,

                        workItemId:
                            comment.workItemId,

                        content:
                            trimmed,
                    }
                );

                toast.success(
                    "Comment updated."
                );

                setEditing(false);
            } catch (error) {
                console.error(
                    "Failed to update comment:",
                    error
                );

                toast.error(
                    "Failed to update comment."
                );
            }
        };

    const handleDelete =
        async () => {
            const confirmed =
                window.confirm(
                    "Delete this comment?"
                );

            if (!confirmed) {
                return;
            }

            try {
                await deleteMutation.mutateAsync(
                    {
                        id:
                            comment.id,

                        workItemId:
                            comment.workItemId,
                    }
                );

                toast.success(
                    "Comment deleted."
                );
            } catch (error) {
                console.error(
                    "Failed to delete comment:",
                    error
                );

                toast.error(
                    "Failed to delete comment."
                );
            }
        };

    return (
        <div className="rounded-xl border p-3">

            {/* Header */}

            <div className="flex items-start justify-between gap-3">

                <div className="flex min-w-0 items-center gap-2">

                    {/* Avatar */}

                    <div className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-muted
                        text-xs
                        font-medium
                    ">
                        {author?.fullName
                            ?.trim()
                            ?.charAt(0)
                            ?.toUpperCase() ??
                            "?"}
                    </div>

                    {/* User information */}

                    <div className="min-w-0">

                        <div className="
                            flex
                            items-center
                            gap-1.5
                        ">

                            <p className="
                                truncate
                                text-sm
                                font-medium
                            ">
                                {author?.fullName ??
                                    "Unknown user"}
                            </p>

                            {/* Online status */}

                            {author?.id && (
                                <OnlineIndicator
                                    userId={
                                        author.id
                                    }
                                />
                            )}

                        </div>

                        {author?.email && (
                            <p className="
                                truncate
                                text-xs
                                text-muted-foreground
                            ">
                                {author.email}
                            </p>
                        )}

                    </div>

                </div>

            </div>

            {/* Content */}

            {editing ? (
                <div className="mt-3 space-y-2">

                    <Textarea
                        value={
                            content
                        }
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
                        autoFocus
                    />

                    <div className="flex justify-end gap-2">

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setContent(
                                    comment.content
                                );

                                setEditing(
                                    false
                                );
                            }}
                            disabled={
                                updateMutation.isPending
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            onClick={
                                handleUpdate
                            }
                            disabled={
                                updateMutation.isPending
                            }
                        >
                            {updateMutation.isPending
                                ? "Saving..."
                                : "Save"}
                        </Button>

                    </div>

                </div>
            ) : (
                <>
                    <p className="
                        mt-3
                        whitespace-pre-wrap
                        text-sm
                        text-foreground
                    ">
                        {comment.content}
                    </p>

                    <div className="
                        mt-3
                        flex
                        items-center
                        justify-between
                        gap-3
                        border-t
                        pt-2
                    ">

                        <span className="
                            text-xs
                            text-muted-foreground
                        ">
                            {formatDate(
                                (
                                    comment as Comment & {
                                        createdAt?: string;
                                    }
                                )
                                    .createdAt
                            )}
                        </span>

                        <div className="
                            flex
                            items-center
                            gap-1
                        ">

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    setEditing(
                                        true
                                    )
                                }
                                disabled={
                                    deleteMutation.isPending
                                }
                            >
                                <Pencil className="mr-1 h-3.5 w-3.5" />
                                Edit
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={
                                    handleDelete
                                }
                                disabled={
                                    deleteMutation.isPending
                                }
                            >
                                <Trash2 className="mr-1 h-3.5 w-3.5" />

                                {deleteMutation.isPending
                                    ? "Deleting..."
                                    : "Delete"}
                            </Button>

                        </div>

                    </div>
                </>
            )}

        </div>
    );
}