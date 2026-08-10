import { useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import CreateWorkItemDialog from "@/features/work-items/components/CreateWorkItemDialog";
import WorkItemDetailsDialog from "@/features/work-items/components/WorkItemDetailsDialog";
import WorkItemCard from "@/features/work-items/components/WorkItemCard";
import ArchivedWorkItems from "@/features/work-items/components/ArchivedWorkItems";

import { useMoveWorkItem } from "@/features/work-items/hooks/useMoveWorkItem";
import { useOrganizationUsers } from "@/features/work-items/hooks/useOrganizationUsers";

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

type Column = {
    id: string;
    name: string;
    description?: string | null;
    displayOrder: number;
    workItems: WorkItem[];
};

type Props = {
    column: Column;
    columns: Column[];
    onOptimisticMove: (
        workItemId: string,
        destinationColumnId: string,
        destinationIndex: number
    ) => void;
};

type DragData = {
    workItemId: string;
};

const DRAG_TYPE = "application/flowforge-work-item";

export default function ColumnCard({
    column,
    columns,
    onOptimisticMove,
}: Props) {
    const { boardId } = useParams();

    const [createOpen, setCreateOpen] =
        useState(false);

    const [detailsOpen, setDetailsOpen] =
        useState(false);

    const [
        selectedWorkItemId,
        setSelectedWorkItemId,
    ] = useState<string | null>(null);

    const [
        dragOverIndex,
        setDragOverIndex,
    ] = useState<number | null>(null);

    const moveMutation =
        useMoveWorkItem();

    /*
     * Load organization users.
     *
     * This is the missing piece that
     * allows:
     *
     * assigneeId -> user -> fullName
     */
    const {
        data: users = [],
    } = useOrganizationUsers();

    const activeWorkItems = [
        ...column.workItems,
    ]
        .filter(
            (item) => !item.isArchived
        )
        .sort(
            (a, b) =>
                a.displayOrder -
                b.displayOrder
        );

    const readDragData = (
        event: React.DragEvent
    ): DragData | null => {
        const raw =
            event.dataTransfer.getData(
                DRAG_TYPE
            );

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(
                raw
            ) as DragData;
        } catch {
            return null;
        }
    };

    const findSourceColumn = (
        workItemId: string
    ) => {
        return columns.find(
            (currentColumn) =>
                currentColumn.workItems.some(
                    (item) =>
                        item.id ===
                        workItemId
                )
        );
    };

    const moveItem = async (
        workItemId: string,
        destinationIndex: number
    ) => {
        const sourceColumn =
            findSourceColumn(
                workItemId
            );

        if (!sourceColumn) {
            return;
        }

        const sourceItems = [
            ...sourceColumn.workItems,
        ]
            .filter(
                (item) =>
                    !item.isArchived
            )
            .sort(
                (a, b) =>
                    a.displayOrder -
                    b.displayOrder
            );

        const sourceIndex =
            sourceItems.findIndex(
                (item) =>
                    item.id ===
                    workItemId
            );

        let backendIndex =
            destinationIndex;

        if (
            sourceColumn.id ===
                column.id &&
            sourceIndex !== -1 &&
            sourceIndex <
                destinationIndex
        ) {
            backendIndex--;
        }

        if (
            sourceColumn.id ===
                column.id &&
            sourceIndex ===
                backendIndex
        ) {
            return;
        }

        onOptimisticMove(
            workItemId,
            column.id,
            destinationIndex
        );

        try {
            await moveMutation.mutateAsync(
                {
                    id: workItemId,
                    data: {
                        destinationColumnId:
                            column.id,
                        destinationIndex:
                            Math.max(
                                0,
                                backendIndex
                            ),
                    },
                }
            );

            toast.success(
                "Work Item moved."
            );
        } catch (error) {
            console.error(
                "Failed to move Work Item:",
                error
            );

            toast.error(
                "Failed to move Work Item."
            );
        }
    };

    const handleCardDragOver = (
        event: React.DragEvent,
        index: number
    ) => {
        event.preventDefault();
        event.stopPropagation();

        event.dataTransfer.dropEffect =
            "move";

        const rect =
            event.currentTarget.getBoundingClientRect();

        const middle =
            rect.top +
            rect.height / 2;

        const destinationIndex =
            event.clientY < middle
                ? index
                : index + 1;

        setDragOverIndex(
            destinationIndex
        );
    };

    const handleCardDrop = async (
        event: React.DragEvent,
        index: number
    ) => {
        event.preventDefault();
        event.stopPropagation();

        const dragData =
            readDragData(event);

        setDragOverIndex(null);

        if (!dragData) {
            return;
        }

        if (
            dragData.workItemId ===
            activeWorkItems[index]?.id
        ) {
            return;
        }

        const rect =
            event.currentTarget.getBoundingClientRect();

        const middle =
            rect.top +
            rect.height / 2;

        const destinationIndex =
            event.clientY < middle
                ? index
                : index + 1;

        await moveItem(
            dragData.workItemId,
            destinationIndex
        );
    };

    const handleColumnDragOver = (
        event: React.DragEvent
    ) => {
        event.preventDefault();

        event.dataTransfer.dropEffect =
            "move";

        setDragOverIndex(
            activeWorkItems.length
        );
    };

    const handleColumnDrop = async (
        event: React.DragEvent
    ) => {
        event.preventDefault();

        const dragData =
            readDragData(event);

        setDragOverIndex(null);

        if (!dragData) {
            return;
        }

        await moveItem(
            dragData.workItemId,
            activeWorkItems.length
        );
    };

    /*
     * Open Work Item details.
     *
     * Pass the ID, not the click event.
     */
    const handleWorkItemClick = (
        workItemId: string
    ) => {
        setSelectedWorkItemId(
            workItemId
        );

        setDetailsOpen(true);
    };

    return (
        <Card className="flex min-h-[550px] flex-col rounded-2xl">

            {/* Header */}
            <div className="border-b p-4">

                <div className="flex items-center justify-between">

                    <h3 className="font-semibold">
                        {column.name}
                    </h3>

                    <span className="rounded-full bg-muted px-2 py-1 text-xs">
                        {
                            activeWorkItems.length
                        }
                    </span>

                </div>

                {column.description && (
                    <p className="mt-2 text-xs text-muted-foreground">
                        {
                            column.description
                        }
                    </p>
                )}

            </div>

            {/* Active Work Items */}
            <div
                className="flex-1 overflow-y-auto p-4"
                onDragOver={
                    handleColumnDragOver
                }
                onDrop={
                    handleColumnDrop
                }
            >

                {activeWorkItems.length ===
                0 ? (
                    <div
                        className="
                            flex
                            min-h-[220px]
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-dashed
                            text-sm
                            text-muted-foreground
                        "
                    >
                        No tasks yet.
                    </div>
                ) : (
                    <div className="space-y-3">

                        {activeWorkItems.map(
                            (
                                item,
                                index
                            ) => (
                                <div
                                    key={
                                        item.id
                                    }
                                >

                                    <div
                                        className={`
                                            h-1
                                            rounded-full
                                            transition-all
                                            ${
                                                dragOverIndex ===
                                                index
                                                    ? "mb-2 bg-primary opacity-100"
                                                    : "opacity-0"
                                            }
                                        `}
                                    />

                                    <div
                                        onDragOver={(
                                            event
                                        ) =>
                                            handleCardDragOver(
                                                event,
                                                index
                                            )
                                        }
                                        onDrop={(
                                            event
                                        ) =>
                                            handleCardDrop(
                                                event,
                                                index
                                            )
                                        }
                                    >

                                        <WorkItemCard
                                            item={
                                                item
                                            }

                                            /*
                                             * THIS IS THE
                                             * IMPORTANT FIX.
                                             */
                                            users={
                                                users
                                            }

                                            onClick={() =>
                                                handleWorkItemClick(
                                                    item.id
                                                )
                                            }
                                        />

                                    </div>

                                </div>
                            )
                        )}

                        <div
                            className={`
                                h-4
                                rounded-md
                                transition
                                ${
                                    dragOverIndex ===
                                    activeWorkItems.length
                                        ? "bg-primary/10"
                                        : ""
                                }
                            `}
                            onDragOver={(
                                event
                            ) => {
                                event.preventDefault();

                                event.dataTransfer.dropEffect =
                                    "move";

                                setDragOverIndex(
                                    activeWorkItems.length
                                );
                            }}
                            onDrop={
                                handleColumnDrop
                            }
                        />

                    </div>
                )}

            </div>

            {/* Archived */}
            <ArchivedWorkItems
                columnId={
                    column.id
                }
            />

            {/* Add Task */}
            <div className="border-t p-4">

                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                        setCreateOpen(
                            true
                        )
                    }
                >
                    + Add Task
                </Button>

            </div>

            {/* Create Dialog */}
            <CreateWorkItemDialog
                open={
                    createOpen
                }
                onOpenChange={
                    setCreateOpen
                }
                columnId={
                    column.id
                }
                boardId={
                    boardId!
                }
            />

            {/* Details Dialog */}
            <WorkItemDetailsDialog
                open={
                    detailsOpen
                }
                onOpenChange={
                    setDetailsOpen
                }
                workItemId={
                    selectedWorkItemId
                }
            />

        </Card>
    );
}