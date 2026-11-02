import { useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeError } from "@/lib/errors";

import { useComments } from "../hooks/useComments";
import { useCreateComment } from "../hooks/useCreateComment";

import CommentItem from "./CommentItem";

import type { OrganizationUser } from "@/features/work-items/types/user";

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
    const [content, setContent] = useState("");

    const {
        data: comments = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useComments(workItemId);

    const createMutation = useCreateComment();

    const busy = createMutation.isPending;

    const handleCreate = async () => {
        const trimmed = content.trim();

        if (!trimmed) return;

        try {
            await createMutation.mutateAsync({
                workItemId,
                content: trimmed,
            });

            setContent("");
        } catch (err) {
            console.error("Failed to create comment:", err);

            const { title, description } = normalizeError(err, {
                title: "We couldn't post that comment",
                description: "Your text is still here — try again.",
            });

            toast.error(title, { description });
        }
    };

    return (
        <section
            aria-label="Comments"
            className="space-y-3"
        >
            <SectionHeader
                title="Comments"
                description={
                    isLoading
                        ? undefined
                        : comments.length === 0
                          ? "Nothing said yet."
                          : `${comments.length} comment${comments.length === 1 ? "" : "s"}`
                }
            />

            {isLoading ? (
                <div className="space-y-2" aria-hidden="true">
                    {Array.from({ length: 2 }).map((_, index) => (
                        <Skeleton key={index} className="h-20 rounded-xl" />
                    ))}
                </div>
            ) : isError ? (
                <ErrorState
                    error={error}
                    title="We couldn't load this thread"
                    action={
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void refetch()}
                        >
                            Try again
                        </Button>
                    }
                />
            ) : comments.length === 0 ? (
                <EmptyState
                    icon={MessageSquare}
                    title="No comments yet"
                    description="Raise questions and record decisions here so the context stays with the work item."
                    size="sm"
                    className="rounded-lg border border-dashed border-border-strong py-8"
                />
            ) : (
                <div className="space-y-2.5">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            users={users}
                        />
                    ))}
                </div>
            )}

            {/* ---------------- composer ---------------- */}
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    void handleCreate();
                }}
                className="space-y-2 rounded-xl border border-border bg-surface-muted/50 p-2.5 focus-within:border-ring"
            >
                <label htmlFor="new-comment" className="sr-only">
                    Write a comment
                </label>

                <Textarea
                    id="new-comment"
                    placeholder={
                        disabled
                            ? "Archived — read only"
                            : "Write a comment…"
                    }
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    rows={3}
                    maxLength={5000}
                    disabled={disabled || busy}
                    onKeyDown={(event) => {
                        /* Ctrl/Cmd + Enter is the convention here; a bare
                           Enter should still write a newline. */
                        if (
                            (event.metaKey || event.ctrlKey) &&
                            event.key === "Enter"
                        ) {
                            event.preventDefault();
                            void handleCreate();
                        }
                    }}
                    className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                />

                <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] text-muted-foreground">
                        <kbd className="rounded border border-border bg-card px-1 font-sans text-[10px]">
                            Ctrl
                        </kbd>
                        {" + "}
                        <kbd className="rounded border border-border bg-card px-1 font-sans text-[10px]">
                            Enter
                        </kbd>{" "}
                        to post
                    </p>

                    <Button
                        type="submit"
                        size="sm"
                        disabled={disabled || busy || !content.trim()}
                    >
                        {busy && <Loader2 className="animate-spin" />}
                        {busy ? "Posting…" : "Comment"}
                    </Button>
                </div>
            </form>
        </section>
    );
}
