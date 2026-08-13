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

function formatDueDate(
    dueDate?: string | null
) {
    if (!dueDate) {
        return null;
    }

    const date =
        new Date(dueDate);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );
}

function getStatusLabel(
    status: number
) {
    switch (status) {
        case 1:
            return "Active";

        case 2:
            return "Completed";

        case 3:
            return "Blocked";

        default:
            return "Unknown";
    }
}

function getStatusClasses(
    status: number
) {
    switch (status) {
        case 1:
            return `
                border-blue-200
                bg-blue-50
                text-blue-700
            `;

        case 2:
            return `
                border-green-200
                bg-green-50
                text-green-700
            `;

        case 3:
            return `
                border-red-200
                bg-red-50
                text-red-700
            `;

        default:
            return `
                border-gray-200
                bg-gray-50
                text-gray-700
            `;
    }
}

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

    const dueDate =
        formatDueDate(
            item.dueDate
        );

    const assignee =
        item.assigneeId
            ? users.find(
                  (user) =>
                      user.id ===
                      item.assigneeId
              )
            : undefined;

    const statusLabel =
        getStatusLabel(
            item.status
        );

    const statusClasses =
        getStatusClasses(
            item.status
        );

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
                className="
                    cursor-pointer
                    rounded-xl
                    p-3
                    transition
                    hover:-translate-y-0.5
                    hover:shadow-md
                "
            >

                {/* =================================
                    HEADER
                ================================== */}

                <div className="
                    flex
                    items-start
                    justify-between
                    gap-3
                ">

                    <h4 className="
                        min-w-0
                        font-medium
                    ">
                        {item.title}
                    </h4>

                    <div className="
                        flex
                        shrink-0
                        items-center
                        gap-1.5
                    ">

                        <span
                            className={`
                                rounded-full
                                border
                                px-2
                                py-0.5
                                text-[10px]
                                font-medium
                                ${statusClasses}
                            `}
                        >
                            {statusLabel}
                        </span>

                        <span className="
                            rounded-full
                            bg-muted
                            px-2
                            py-0.5
                            text-[10px]
                            font-medium
                        ">
                            P{item.priority}
                        </span>

                    </div>

                </div>

                {/* =================================
                    DESCRIPTION
                ================================== */}

                {item.description && (
                    <p className="
                        mt-2
                        line-clamp-2
                        text-sm
                        text-muted-foreground
                    ">
                        {item.description}
                    </p>
                )}

                {/* =================================
                    DUE DATE
                ================================== */}

                {dueDate && (
                    <p className="
                        mt-3
                        text-xs
                        text-muted-foreground
                    ">
                        Due: {dueDate}
                    </p>
                )}

                {/* =================================
                    ASSIGNEE
                ================================== */}

                {assignee && (
                    <div className="
                        mt-3
                        flex
                        items-center
                        gap-2
                        border-t
                        pt-3
                    ">

                        <div className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-muted
                            text-xs
                            font-medium
                        ">
                            {assignee.fullName
                                .trim()
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="
                            min-w-0
                            flex-1
                        ">
                            <div className="
                                flex
                                min-w-0
                                items-center
                                gap-1.5
                            ">
                                <p className="
                                    min-w-0
                                    truncate
                                    text-xs
                                    font-medium
                                ">
                                    {
                                        assignee.fullName
                                    }
                                </p>

                                <OnlineIndicator
                                    userId={
                                        assignee.id
                                    }
                                />
                            </div>

                            {assignee.email && (
                                <p className="
                                    truncate
                                    text-[11px]
                                    text-muted-foreground
                                ">
                                    {
                                        assignee.email
                                    }
                                </p>
                            )}
                        </div>

                    </div>
                )}

                {/* =================================
                    CHECKLIST
                ================================== */}

                <div className="
                    mt-3
                    border-t
                    pt-3
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                        text-xs
                    ">

                        <div className="
                            flex
                            items-center
                            gap-1.5
                            text-muted-foreground
                        ">

                            <CheckSquare className="
                                h-3.5
                                w-3.5
                            " />

                            <span>
                                Checklist
                            </span>

                            <span className="
                                rounded-full
                                bg-muted
                                px-1.5
                                py-0.5
                                text-[10px]
                                font-medium
                                text-foreground
                            ">
                                {
                                    checklistCompleted
                                }
                                /
                                {
                                    checklistTotal
                                }
                            </span>

                        </div>

                        <span className="
                            text-[10px]
                            text-muted-foreground
                        ">
                            {
                                checklistPercentage
                            }%
                        </span>

                    </div>

                    <div className="
                        mt-2
                        h-1.5
                        w-full
                        overflow-hidden
                        rounded-full
                        bg-muted
                    ">

                        <div
                            className="
                                h-full
                                rounded-full
                                bg-foreground
                                transition-all
                            "
                            style={{
                                width: `${Math.min(
                                    100,
                                    Math.max(
                                        0,
                                        checklistPercentage
                                    )
                                )}%`,
                            }}
                        />

                    </div>

                </div>

                {/* =================================
                    COMMENTS + WATCHERS + LABELS
                ================================== */}

                <div className="
                    mt-3
                    flex
                    flex-wrap
                    items-center
                    gap-x-4
                    gap-y-1
                    border-t
                    pt-3
                ">

                    {/* COMMENTS */}

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="
                            h-7
                            w-auto
                            justify-start
                            px-1
                            text-xs
                            text-muted-foreground
                            hover:bg-transparent
                            hover:text-foreground
                        "
                        onClick={
                            handleCommentsClick
                        }
                    >
                        <MessageCircle className="
                            mr-1.5
                            h-3.5
                            w-3.5
                        " />

                        <span>
                            Comments
                        </span>

                        <span className="
                            ml-1
                            rounded-full
                            bg-muted
                            px-1.5
                            py-0.5
                            text-[10px]
                            font-medium
                            text-foreground
                        ">
                            {commentCount}
                        </span>
                    </Button>

                    {/* WATCHERS */}

                    <div
                        onClick={(
                            event
                        ) =>
                            event.stopPropagation()
                        }
                    >
                        <WorkItemWatchers
                            workItemId={
                                item.id
                            }
                            workItemTitle={
                                item.title
                            }
                        />
                    </div>

                    {/* LABELS */}

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="
                            h-7
                            w-auto
                            justify-start
                            px-1
                            text-xs
                            text-muted-foreground
                            hover:bg-transparent
                            hover:text-foreground
                        "
                        onClick={
                            handleLabelsClick
                        }
                    >
                        <Tag className="
                            mr-1.5
                            h-3.5
                            w-3.5
                        " />

                        <span>
                            Labels
                        </span>

                        <span className="
                            ml-1
                            rounded-full
                            bg-muted
                            px-1.5
                            py-0.5
                            text-[10px]
                            font-medium
                            text-foreground
                        ">
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