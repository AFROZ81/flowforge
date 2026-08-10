import { useEffect, useState } from "react";
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

    useEffect(() => {
        setLocalColumns(columns);
    }, [columns]);

    const handleOptimisticMove = (
        workItemId: string,
        destinationColumnId: string,
        destinationIndex: number
    ) => {
        setLocalColumns(
            (currentColumns) => {
                const nextColumns =
                    currentColumns.map(
                        (column) => ({
                            ...column,

                            workItems: [
                                ...column.workItems,
                            ],
                        })
                    );

                let movingItem:
                    | WorkItem
                    | undefined;

                for (
                    const column of
                        nextColumns
                ) {
                    const index =
                        column.workItems.findIndex(
                            (item) =>
                                item.id ===
                                workItemId
                        );

                    if (index !== -1) {
                        [
                            movingItem,
                        ] =
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

                if (
                    !destinationColumn
                ) {
                    return currentColumns;
                }

                const safeIndex =
                    Math.max(
                        0,
                        Math.min(
                            destinationIndex,
                            destinationColumn
                                .workItems
                                .length
                        )
                    );

                destinationColumn.workItems.splice(
                    safeIndex,
                    0,
                    movingItem
                );

                for (
                    const column of
                        nextColumns
                ) {
                    column.workItems =
                        column.workItems.map(
                            (
                                item,
                                index
                            ) => ({
                                ...item,

                                displayOrder:
                                    index *
                                    1000,
                            })
                        );
                }

                return nextColumns;
            }
        );
    };

    return (
        <div className="grid gap-6 xl:grid-cols-5">
            {[
                ...localColumns,
            ]
                .sort(
                    (a, b) =>
                        a.displayOrder -
                        b.displayOrder
                )
                .map((column) => (
                    <ColumnCard
                        key={column.id}
                        column={column}
                        columns={
                            localColumns
                        }
                        onOptimisticMove={
                            handleOptimisticMove
                        }
                    />
                ))}
        </div>
    );
}