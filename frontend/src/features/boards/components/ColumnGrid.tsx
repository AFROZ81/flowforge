import ColumnCard from "./ColumnCard";

type WorkItem = {
    id: string;
    title: string;
    description?: string;
    priority: number;
    status: number;
    displayOrder: number;
    dueDate?: string;
    isArchived: boolean;
};

type Column = {
    id: string;
    name: string;
    description?: string;
    displayOrder: number;
    workItems: WorkItem[];
};

type Props = {
    columns: Column[];
};

export default function ColumnGrid({
    columns,
}: Props) {
    return (
        <div className="grid gap-6 xl:grid-cols-5">

            {columns
                .sort(
                    (a, b) =>
                        a.displayOrder -
                        b.displayOrder
                )
                .map((column) => (
                    <ColumnCard
                        key={column.id}
                        column={column}
                    />
                ))}

        </div>
    );
}