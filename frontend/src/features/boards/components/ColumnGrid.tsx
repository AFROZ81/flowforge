import { useState, useEffect } from "react";
import { Columns3 } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import ColumnCard from "./ColumnCard";
import { useBoardKeyboard } from "../hooks/useBoardKeyboard";

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
    columns: Column[];
};

export default function ColumnGrid({
    columns,
}: Props) {
    const [
        localColumns,
        setLocalColumns,
    ] = useState<Column[]>(columns);

    /*
     * Server data is the source of truth; optimistic moves live on top of
     * it until the next response lands. Adjusting during render (rather
     * than in an effect) avoids a second pass over the whole board.
     */
    const [lastColumns, setLastColumns] = useState(columns);

    if (lastColumns !== columns) {
        setLastColumns(columns);
        setLocalColumns(columns);
    }

    const handleOptimisticMove = (
        workItemId: string,
        destinationColumnId: string,
        destinationIndex: number
    ) => {
        setLocalColumns((currentColumns) => {
            const nextColumns =
                currentColumns.map((column) => ({
                    ...column,
                    workItems: [
                        ...column.workItems,
                    ],
                }));

            let movingItem:
                | WorkItem
                | undefined;

            for (const column of nextColumns) {
                const index =
                    column.workItems.findIndex(
                        (item) =>
                            item.id ===
                            workItemId
                    );

                if (index !== -1) {
                    [movingItem] =
                        column.workItems.splice(
                            index,
                            1
                        );

                    break;
                }
            }

            if (!movingItem) {
                return currentColumns;
            }

            const destinationColumn =
                nextColumns.find(
                    (column) =>
                        column.id ===
                        destinationColumnId
                );

            if (!destinationColumn) {
                return currentColumns;
            }

            const safeIndex = Math.max(
                0,
                Math.min(
                    destinationIndex,
                    destinationColumn.workItems
                        .length
                )
            );

            destinationColumn.workItems.splice(
                safeIndex,
                0,
                movingItem
            );

            for (const column of nextColumns) {
                column.workItems =
                    column.workItems.map(
                        (item, index) => ({
                            ...item,
                            displayOrder:
                                index * 1000,
                        })
                    );
            }

            return nextColumns;
        });
    };

    const {
        focus,
        handleKeyDown,
        setColumnFocus,
        setCardFocus,
    } = useBoardKeyboard({
        columns: localColumns,
        actions: {
            onOpenWorkItem: (workItemId) => {
                window.dispatchEvent(
                    new CustomEvent("flowforge:open-work-item", {
                        detail: { workItemId },
                    })
                );
            },
            onEditWorkItem: (workItemId) => {
                window.dispatchEvent(
                    new CustomEvent("flowforge:edit-work-item", {
                        detail: { workItemId },
                    })
                );
            },
            onOpenComments: (workItemId) => {
                window.dispatchEvent(
                    new CustomEvent("flowforge:open-comments", {
                        detail: { workItemId },
                    })
                );
            },
            onOpenLabels: (workItemId) => {
                window.dispatchEvent(
                    new CustomEvent("flowforge:open-labels", {
                        detail: { workItemId },
                    })
                );
            },
            onSetDueDate: (workItemId) => {
                window.dispatchEvent(
                    new CustomEvent("flowforge:set-due-date", {
                        detail: { workItemId },
                    })
                );
            },
            onToggleComplete: (workItemId, status) => {
                window.dispatchEvent(
                    new CustomEvent("flowforge:toggle-complete", {
                        detail: { workItemId, status },
                    })
                );
            },
        },
    });

    /*
     * Attach the keyboard handler to the document so it fires regardless of
     * which element holds DOM focus. React focus state drives routing; the
     * handler itself ignores editable inputs.
     */
    useEffect(() => {
        document.addEventListener(
            "keydown",
            handleKeyDown as EventListener
        );

        /*
         * When a user clicks a column header or card, keyboard focus follows
         * so arrow-key navigation keeps working from that spot.
         */
        const onFocusColumn = (
            event: CustomEvent<{ columnId: string }>
        ) => {
            const index = localColumns.findIndex(
                (c) => c.id === event.detail.columnId
            );
            if (index !== -1) {
                setColumnFocus(index);
            }
        };

        const onFocusCard = (
            event: CustomEvent<{ columnId: string; workItemId: string }>
        ) => {
            const columnIndex = localColumns.findIndex(
                (c) => c.id === event.detail.columnId
            );
            if (columnIndex === -1) {
                return;
            }
            const column = localColumns[columnIndex];
            const activeItems = [
                ...column.workItems,
            ]
                .filter((item) => !item.isArchived)
                .sort(
                    (a, b) => a.displayOrder - b.displayOrder
                );
            const cardIndex = activeItems.findIndex(
                (item) => item.id === event.detail.workItemId
            );
            if (cardIndex !== -1) {
                setCardFocus(columnIndex, cardIndex);
            }
        };

        window.addEventListener(
            "flowforge:focus-column",
            onFocusColumn as EventListener
        );
        window.addEventListener(
            "flowforge:focus-card",
            onFocusCard as EventListener
        );

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener(
                "flowforge:focus-column",
                onFocusColumn as EventListener
            );
            window.removeEventListener(
                "flowforge:focus-card",
                onFocusCard as EventListener
            );
        };
    }, [handleKeyDown, localColumns, setColumnFocus, setCardFocus]);

    const isColumnFocused = (index: number) =>
        focus?.kind === "column" && focus.columnIndex === index;

    const focusedCardIndex = (columnIndex: number) =>
        focus?.kind === "card" && focus.columnIndex === columnIndex
            ? focus.cardIndex
            : null;

    if (localColumns.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card shadow-xs">
                <EmptyState
                    icon={Columns3}
                    title="This board has no columns"
                    description="Add a column to start organizing work items on this board."
                    size="sm"
                    className="py-10"
                />
            </div>
        );
    }

    return (
        /*
         * Flowing columns rather than a fixed five-up grid: boards have a
         * user-chosen number of columns, and a phone gets one full-width
         * column per row instead of a sideways scroll.
         */
        <div
            tabIndex={-1}
            className="
                grid gap-4
                grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))]
                lg:gap-5
                outline-none
            "
        >
            {[...localColumns]
                .sort(
                    (a, b) =>
                        a.displayOrder -
                        b.displayOrder
                )
                .map((column, columnIndex) => (
                    <ColumnCard
                        key={column.id}
                        column={column}
                        columns={localColumns}
                        onOptimisticMove={
                            handleOptimisticMove
                        }
                        isColumnFocused={
                            isColumnFocused(columnIndex)
                        }
                        focusedCardIndex={
                            focusedCardIndex(columnIndex)
                        }
                    />
                ))}
        </div>
    );
}
