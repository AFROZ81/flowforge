import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import { toast } from "@/lib/toast";
import { ListPlus, Plus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/common/indicators";

import CreateWorkItemDialog from "@/features/work-items/components/CreateWorkItemDialog";
import WorkItemDetailsDialog from "@/features/work-items/components/WorkItemDetailsDialog";
import WorkItemCard from "@/features/work-items/components/WorkItemCard";
import ArchivedWorkItems from "@/features/work-items/components/ArchivedWorkItems";

import { useMoveWorkItem } from "@/features/work-items/hooks/useMoveWorkItem";
import { useCompleteWorkItem } from "@/features/work-items/hooks/useCompleteWorkItem";
import { useActivateWorkItem } from "@/features/work-items/hooks/useActivateWorkItem";
import { useOrganizationUsers } from "@/features/work-items/hooks/useOrganizationUsers";
import { useAuthStore } from "@/stores/auth.store";
import { isMemberRole } from "@/lib/auth-roles";

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
    /** Whether this column's header currently holds keyboard focus. */
    isColumnFocused: boolean;
    /** Index of the focused card within this column, or null. */
    focusedCardIndex: number | null;
};

type DragData = {
    workItemId: string;
};

const DRAG_TYPE =
    "application/flowforge-work-item";

export default function ColumnCard({
    column,
    columns,
    onOptimisticMove,
    isColumnFocused,
    focusedCardIndex,
}: Props) {
    const { boardId } = useParams();
    const currentUserRole = useAuthStore((state) => state.user?.role);
    const canEdit = isMemberRole(currentUserRole);

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
     */
    const {
        data: users = [],
    } = useOrganizationUsers();

    const completeMutation = useCompleteWorkItem();
    const activateMutation = useActivateWorkItem();

    /*
     * Active work items only.
     *
     * Always sort by displayOrder so the
     * drag/drop indexes match the UI.
     */
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

    /*
     * ==========================================
     * KEYBOARD FOCUS
     * ==========================================
     */

    const setColumnFocus = useCallback(() => {
        window.dispatchEvent(
            new CustomEvent("flowforge:focus-column", {
                detail: { columnId: column.id },
            })
        );
    }, [column.id]);

    const setCardFocus = useCallback(
        (workItemId: string) => {
            window.dispatchEvent(
                new CustomEvent("flowforge:focus-card", {
                    detail: { columnId: column.id, workItemId },
                })
            );
        },
        [column.id]
    );

    /*
     * Open the work-item details dialog for a card in this column.
     */
    const openWorkItem = useCallback(
        (workItemId: string) => {
            if (
                !activeWorkItems.some(
                    (item) => item.id === workItemId
                )
            ) {
                return;
            }

            setSelectedWorkItemId(workItemId);
            setDetailsOpen(true);
        },
        [activeWorkItems]
    );

    /*
     * Wire the board keyboard actions (dispatched from ColumnGrid) to the
     * real column-level handlers. ColumnGrid owns keyboard focus state, but
     * this column owns the dialogs and mutations for its own cards.
     */
    useEffect(() => {
        const onOpenWorkItem = (
            event: CustomEvent<{ workItemId: string }>
        ) => {
            openWorkItem(event.detail.workItemId);
        };

        const onToggleComplete = (
            event: CustomEvent<{ workItemId: string; status: number }>
        ) => {
            const item = activeWorkItems.find(
                (i) => i.id === event.detail.workItemId
            );

            if (!canEdit || !item) {
                return;
            }

            if (event.detail.status === 2) {
                completeMutation.mutate(item.id);
            } else {
                activateMutation.mutate(item.id);
            }
        };

        window.addEventListener(
            "flowforge:open-work-item",
            onOpenWorkItem as EventListener
        );
        window.addEventListener(
            "flowforge:toggle-complete",
            onToggleComplete as EventListener
        );

        return () => {
            window.removeEventListener(
                "flowforge:open-work-item",
                onOpenWorkItem as EventListener
            );
            window.removeEventListener(
                "flowforge:toggle-complete",
                onToggleComplete as EventListener
            );
        };
    }, [activeWorkItems, canEdit, completeMutation, activateMutation, openWorkItem]);

    /*
     * ==========================================
     * DRAG START
     * ==========================================
     */
    const handleDragStart = (
        event: React.DragEvent,
        workItemId: string
    ) => {
        if (!canEdit) return;

        const dragData: DragData = {
            workItemId,
        };

        event.dataTransfer.setData(
            DRAG_TYPE,
            JSON.stringify(dragData)
        );

        event.dataTransfer.setData(
            "text/plain",
            workItemId
        );

        event.dataTransfer.effectAllowed =
            "move";
    };

    /*
     * Clear drag state when dragging ends.
     */
    const handleDragEnd = () => {
        setDragOverIndex(null);
    };

    /*
     * READ DRAG DATA
     */
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

    /*
     * FIND SOURCE COLUMN
     */
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

    /*
     * MOVE WORK ITEM
     */
    const moveItem = async (
        workItemId: string,
        destinationIndex: number
    ) => {
        if (!canEdit) return;

        const sourceColumn =
            findSourceColumn(
                workItemId
            );

        if (!sourceColumn) {
            console.error(
                "Source column not found for:",
                workItemId
            );

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

    /*
     * DRAG OVER WORK ITEM
     */
    const handleCardDragOver = (
        event: React.DragEvent,
        index: number
    ) => {
        if (!canEdit) return;

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

    /*
     * DROP ON WORK ITEM
     */
    const handleCardDrop = async (
        event: React.DragEvent,
        index: number
    ) => {
        if (!canEdit) return;

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

    /*
     * DRAG OVER EMPTY/END OF COLUMN
     */
    const handleColumnDragOver = (
        event: React.DragEvent
    ) => {
        if (!canEdit) return;

        event.preventDefault();

        event.dataTransfer.dropEffect =
            "move";

        setDragOverIndex(
            activeWorkItems.length
        );
    };

    /*
     * DROP AT END OF COLUMN
     */
    const handleColumnDrop = async (
        event: React.DragEvent
    ) => {
        if (!canEdit) return;

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
     * OPEN WORK ITEM DETAILS
     */
    const handleWorkItemClick = (
        workItemId: string
    ) => {
        setSelectedWorkItemId(workItemId);
        setDetailsOpen(true);
    };

    return (
        <Card
            className="
                flex min-h-[18rem] max-h-[min(44rem,75vh)] min-w-0 flex-col gap-0 rounded-xl p-0
                shadow-xs
            "
        >

            {/* =================================
                HEADER
            ================================== */}

            <div
                className="
                    shrink-0 border-b border-border px-3.5 py-3
                    flex items-center justify-between gap-3
                    outline-none
                "
                onClick={setColumnFocus}
                role={isColumnFocused ? "button" : undefined}
                aria-label={column.name}
            >

                <div className="flex items-center gap-2">

                    <h3 className="flex min-w-0 items-center gap-2 text-[13px] font-semibold tracking-[-0.01em] text-foreground">
                        <StatusDot status={column.name} />
                        <span className="truncate">
                            {column.name}
                        </span>
                    </h3>

                    <span className="shrink-0 rounded-full bg-surface-sunken px-2 py-0.5 text-[11px] font-semibold text-muted-foreground tabular-nums">
                        {activeWorkItems.length}
                    </span>

                </div>

                {column.description && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {column.description}
                    </p>
                )}

            </div>

            {/* =================================
                ACTIVE WORK ITEMS
            ================================== */}

            <div
                className="
                    min-h-0
                    flex-1
                    overflow-y-auto
                    overscroll-contain
                    p-3
                "
                onDragOver={
                    canEdit ? handleColumnDragOver : undefined
                }
                onDrop={
                    canEdit ? handleColumnDrop : undefined
                }
            >

                {activeWorkItems.length ===
                0 ? (
                    <div className="
                        flex min-h-[9rem] flex-col items-center justify-center gap-1.5
                        rounded-xl border border-dashed border-border-strong bg-surface-muted/40
                        px-4 py-6 text-center
                    ">
                        <ListPlus className="size-5 text-muted-foreground/60" aria-hidden="true" />

                        <p className="text-[13px] font-medium text-muted-foreground">
                            Nothing here yet
                        </p>

                        <p className="text-xs text-muted-foreground/80">
                            {canEdit
                                ? "Drop a work item in, or add one below."
                                : "Work items added to this column will appear here."}
                        </p>
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

                                    {/* Drop indicator */}

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
                                        draggable={canEdit}
                                        onDragStart={
                                            canEdit
                                                ? (event) => handleDragStart(event, item.id)
                                                : undefined
                                        }
                                        onDragEnd={
                                            canEdit ? handleDragEnd : undefined
                                        }
                                        onDragOver={
                                            canEdit
                                                ? (event) => handleCardDragOver(event, index)
                                                : undefined
                                        }
                                        onDrop={
                                            canEdit
                                                ? (event) => void handleCardDrop(event, index)
                                                : undefined
                                        }
                                    >

                                        <WorkItemCard
                                            item={
                                                item
                                            }
                                            users={
                                                users
                                            }
                                            isFocused={
                                                focusedCardIndex ===
                                                index
                                            }
                                            onClick={() => {
                                                handleWorkItemClick(
                                                    item.id
                                                );
                                                setCardFocus(item.id);
                                            }}
                                        />

                                    </div>

                                </div>
                            )
                        )}

                        {/* =================================
                            DROP AREA AT END
                        ================================== */}

                        {canEdit && <div
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
                                event.stopPropagation();

                                event.dataTransfer.dropEffect =
                                    "move";

                                setDragOverIndex(
                                    activeWorkItems.length
                                );
                            }}
                            onDrop={
                                handleColumnDrop
                            }
                        />}

                    </div>
                )}

            </div>

            {/* =================================
                ARCHIVED
            ================================== */}

            <ArchivedWorkItems
                columnId={
                    column.id
                }
            />

            {/* =================================
                ADD TASK
            ================================== */}

            {canEdit && (
                <div className="shrink-0 border-t border-border p-3">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setCreateOpen(true)}
                    >
                        <Plus />
                        Add work item
                    </Button>
                </div>
            )}

            {/* =================================
                CREATE DIALOG
            ================================== */}

            {canEdit && <CreateWorkItemDialog
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
                existingTitles={
                    activeWorkItems.map((item) => item.title)
                }
            />}

            {/* =================================
                DETAILS DIALOG
            ================================== */}

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
