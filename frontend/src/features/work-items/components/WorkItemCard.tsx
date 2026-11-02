import {
    useState,
} from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import CommentsSection from "@/features/comments/components/CommentsSection";
import { useComments } from "@/features/comments/hooks/useComments";

import {
    useChecklistProgress,
} from "@/features/checklists/hooks/useChecklistProgress";

import WorkItemWatchers from "@/features/work-item-watchers/components/WorkItemWatchers";

import OnlineIndicator from "@/features/presence/components/OnlineIndicator";

import LabelsDialog from "@/features/labels/components/LabelsDialog";
import {
    useWorkItemLabels,
} from "@/features/labels/hooks/useWorkItemLabels";

import {
    CheckSquare,
    MessageCircle,
    Tag,
} from "lucide-react";

import {
    DueDateChip,
    PriorityFlag,
    WorkItemStatusBadge,
} from "@/components/common/indicators";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress";

type WorkItem = {
    id: string;
    title: string;
    description?: string | null;
    priority: number;
    status: number;
    displayOrder: number;
    dueDate?: string | null;
    isArchived: boolean;
    assigneeId?: string | null;
};

type OrganizationUser = {
    id: string;
    fullName: string;
    email?: string | null;
};

type Props = {
    item: WorkItem;
    users?: OrganizationUser[];
    onClick?: () => void;
};

/*
 * Status, priority and due-date chips come from components/common/indicators
 * so a card, a table row and the detail dialog can't disagree about what
 * "Blocked" or "overdue" looks like.
 */

export default function WorkItemCard({
    item,
    users = [],
    onClick,
}: Props) {
    const [
        commentsOpen,
        setCommentsOpen,
    ] = useState(false);

    const [
        labelsOpen,
        setLabelsOpen,
    ] = useState(false);

    /*
     * ========================================
     * COMMENTS
     * ========================================
     */

    const commentsQuery =
        useComments(item.id);

    const commentsData =
        commentsQuery?.data;

    const commentCount =
        Array.isArray(
            commentsData
        )
            ? commentsData.length
            : 0;

    /*
     * ========================================
     * CHECKLIST
     * ========================================
     */

    const {
        data: checklistProgress,
    } =
        useChecklistProgress(
            item.id
        );

    const checklistTotal =
        checklistProgress
            ?.totalItems ??
        0;

    const checklistCompleted =
        checklistProgress
            ?.completedItems ??
        0;

    const checklistPercentage =
        checklistProgress
            ?.progressPercentage ??
        (
            checklistTotal > 0
                ? Math.round(
                      (
                          checklistCompleted /
                          checklistTotal
                      ) * 100
                  )
                : 0
        );

    /*
     * ========================================
     * LABELS
     * ========================================
     */

    const {
        data: workItemLabels = [],
    } =
        useWorkItemLabels(
            item.id
        );

    const labelCount =
        workItemLabels.length;

    /*
     * ========================================
     * OTHER DATA
     * ========================================
     */

    const assignee =
        item.assigneeId
            ? users.find(
                  (user) =>
                      user.id ===
                      item.assigneeId
              )
            : undefined;

    /*
     * ========================================
     * COMMENTS CLICK
     * ========================================
     */

    const handleCommentsClick = (
        event: React.MouseEvent
    ) => {
        event.preventDefault();
        event.stopPropagation();

        setCommentsOpen(true);
    };

    /*
     * ========================================
     * LABELS CLICK
     * ========================================
     */

    const handleLabelsClick = (
        event: React.MouseEvent
    ) => {
        event.preventDefault();
        event.stopPropagation();

        setLabelsOpen(true);
    };

    return (
        <>
            <Card
                draggable
                onClick={onClick}
                onKeyDown={(event) => {
                    /* A card that opens on click must also open on Enter */
                    if (!onClick) return;

                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onClick();
                    }
                }}
                role={onClick ? "button" : undefined}
                tabIndex={onClick ? 0 : undefined}
                aria-label={onClick ? item.title : undefined}
                className="
                    cursor-pointer gap-0 rounded-xl border-border p-3 shadow-xs
                    transition-[transform,box-shadow,border-color] duration-(--transition-normal)
                    ease-(--ease-standard) hover:-translate-y-px hover:border-border-strong hover:shadow-sm
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
                "
            >

                {/* =================================
                    HEADER
                ================================== */}

                <div className="flex items-start justify-between gap-2">

                    <h4 className="min-w-0 text-[13px] leading-snug font-medium text-foreground">
                        {item.title}
                    </h4>

                    <div className="flex shrink-0 items-center gap-1">
                        <WorkItemStatusBadge status={item.status} />
                        <PriorityFlag priority={item.priority} />
                    </div>

                </div>

                {/* =================================
                    DESCRIPTION
                ================================== */}

                {item.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                    </p>
                )}

                {/* =================================
                    DUE DATE
                ================================== */}

                <DueDateChip
                    dueDate={item.dueDate}
                    completed={Number(item.status) === 2}
                    prefix={null}
                    className="mt-2"
                />

                {/* =================================
                    ASSIGNEE
                ================================== */}

                {assignee && (
                    <div className="mt-2.5 flex items-center gap-2 border-t border-border-subtle pt-2.5">

                        <Avatar
                            name={assignee.fullName}
                            size="sm"
                        />

                        <div className="min-w-0 flex-1">
                            <p className="flex min-w-0 items-center gap-1.5">
                                <span className="truncate text-xs font-medium text-foreground">
                                    {assignee.fullName}
                                </span>

                                <OnlineIndicator
                                    userId={assignee.id}
                                />
                            </p>

                            {assignee.email && (
                                <p className="truncate text-[11px] leading-tight text-muted-foreground">
                                    {assignee.email}
                                </p>
                            )}
                        </div>

                    </div>
                )}

                {/* =================================
                    CHECKLIST
                ================================== */}

                {checklistTotal > 0 && (
                    <div className="mt-2.5">
                        <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                <CheckSquare className="size-3.5" aria-hidden="true" />
                                Checklist
                            </span>

                            <span className="font-medium tabular-nums text-muted-foreground">
                                {checklistCompleted}/{checklistTotal}
                            </span>
                        </div>

                        <ProgressBar
                            value={checklistPercentage}
                            tone={checklistPercentage === 100 ? "success" : "brand"}
                            size="xs"
                            label={`${item.title} checklist`}
                        />
                    </div>
                )}

                {/* =================================
                    COMMENTS + WATCHERS + LABELS
                ================================== */}

                <div className="mt-2.5 flex flex-wrap items-center gap-1 border-t border-border-subtle pt-2">

                    {/* COMMENTS */}

                    <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        aria-label={`${commentCount} comments`}
                        className="gap-1 text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
                        onClick={handleCommentsClick}
                    >
                        <MessageCircle />
                        <span className="font-medium tabular-nums">
                            {commentCount}
                        </span>
                    </Button>

                    {/* WATCHERS */}

                    <div onClick={(event) => event.stopPropagation()}>
                        <WorkItemWatchers
                            workItemId={item.id}
                            workItemTitle={item.title}
                        />
                    </div>

                    {/* LABELS */}

                    <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        aria-label={`${labelCount} labels`}
                        className="gap-1 text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
                        onClick={handleLabelsClick}
                    >
                        <Tag />
                        <span className="font-medium tabular-nums">
                            {labelCount}
                        </span>
                    </Button>

                </div>

            </Card>

            {/* =====================================
                COMMENTS DIALOG
            ====================================== */}

            <Dialog
                open={commentsOpen}
                onOpenChange={
                    setCommentsOpen
                }
            >
                <DialogContent
                    className="
                        max-h-[85vh]
                        overflow-y-auto
                        sm:max-w-lg
                    "
                >
                    <DialogHeader>
                        <DialogTitle>
                            Comments
                        </DialogTitle>

                        <DialogDescription>
                            Discuss "
                            {item.title}"
                        </DialogDescription>
                    </DialogHeader>

                    <CommentsSection
                        workItemId={
                            item.id
                        }
                        users={
                            users
                        }
                        disabled={
                            item.isArchived
                        }
                    />
                </DialogContent>
            </Dialog>

            {/* =====================================
                LABELS DIALOG
            ====================================== */}

            <LabelsDialog
                open={labelsOpen}
                onOpenChange={
                    setLabelsOpen
                }
                workItemId={
                    item.id
                }
                workItemTitle={
                    item.title
                }
            />
        </>
    );
}