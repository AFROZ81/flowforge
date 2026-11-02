import { useState } from "react";
import { Columns3 } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import ColumnCard from "./ColumnCard";

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
            className="
                grid gap-4
                grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))]
                lg:gap-5
            "
        >
            {[...localColumns]
                .sort(
                    (a, b) =>
                        a.displayOrder -
                        b.displayOrder
                )
                .map((column) => (
                    <ColumnCard
                        key={column.id}
                        column={column}
                        columns={localColumns}
                        onOptimisticMove={
                            handleOptimisticMove
                        }
                    />
                ))}
        </div>
    );
}