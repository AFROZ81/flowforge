import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import {
    useConfirm,
} from "@/components/common/confirm";
import { normalizeError } from "@/lib/errors";
import { formatRelativeTime } from "@/lib/format";

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

    const confirm = useConfirm();

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
            const confirmed = await confirm({
                title: "Delete this comment?",
                description:
                    "It disappears from the thread for everyone on this work item.",
                confirmLabel: "Delete comment",
                tone: "destructive",
            });

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

                toast.success("Comment deleted.");
            } catch (error) {
                console.error(
                    "Failed to delete comment:",
                    error
                );

                const { title, description } = normalizeError(error, {
                    title: "We couldn't delete that comment",
                });

                toast.error(title, { description });
            }
        };

    return (
        <div className="rounded-xl border border-border bg-card p-3 shadow-xs">

            {/* Header */}

            <div className="flex items-start justify-between gap-3">

                <div className="flex min-w-0 items-center gap-2.5">

                    <Avatar
                        name={author?.fullName}
                        size="sm"
                        decorative
                    />

                    {/* User information */}

                    <div className="min-w-0">

                        <div className="flex min-w-0 items-center gap-1.5">

                            <p className="truncate text-[13px] font-medium text-foreground">
                                {author?.fullName ?? "Unknown user"}
                            </p>

                            {/* Online status */}

                            {author?.id && (
                                <OnlineIndicator
                                    userId={author.id}
                                />
                            )}

                        </div>

                        {author?.email && (
                            <p
                                className="truncate text-xs text-muted-foreground"
                                title={formatDate(comment.createdAt)}
                            >
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

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-border-subtle pt-2">

                        <time
                            dateTime={comment.createdAt}
                            className="text-xs text-muted-foreground"
                            title={formatDate(comment.createdAt)}
                        >
                            {formatRelativeTime(comment.createdAt)}
                        </time>

                        <div className="flex items-center gap-1">

                            <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => setEditing(true)}
                                disabled={deleteMutation.isPending}
                            >
                                <Pencil />
                                Edit
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                className="text-danger-foreground hover:bg-danger-subtle hover:text-danger-foreground"
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                            >
                                <Trash2 />
                                {deleteMutation.isPending
                                    ? "Deleting…"
                                    : "Delete"}
                            </Button>

                        </div>

                    </div>
                </>
            )}

        </div>
    );
}