import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import { useParams } from "react-router";

import CreateWorkItemDialog from "@/features/work-items/components/CreateWorkItemDialog";

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
    column: Column;
};

export default function ColumnCard({
    column,
}: Props) {

    const [open, setOpen] = useState(false);

    const { boardId } = useParams();

    return (
        <Card className="flex min-h-[550px] flex-col rounded-2xl">

            <div className="border-b p-4">

                <div className="flex items-center justify-between">

                    <h3 className="font-semibold">
                        {column.name}
                    </h3>

                    <span className="rounded-full bg-muted px-2 py-1 text-xs">
                        {column.workItems.length}
                    </span>

                </div>

                {column.description && (
                    <p className="mt-2 text-xs text-muted-foreground">
                        {column.description}
                    </p>
                )}

            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">

                {column.workItems.length === 0 ? (
                    <div className="pt-16 text-center text-sm text-muted-foreground">
                        No tasks yet.
                    </div>
                ) : (
                    column.workItems
                        .sort(
                            (a, b) =>
                                a.displayOrder -
                                b.displayOrder
                        )
                        .map((item) => (
                            <Card
                                key={item.id}
                                className="cursor-pointer p-3 transition hover:shadow-md"
                            >
                                <h4 className="font-medium">
                                    {item.title}
                                </h4>

                                {item.description && (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {item.description}
                                    </p>
                                )}
                            </Card>
                        ))
                )}

            </div>

            <div className="border-t p-4">

                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setOpen(true)}
                >
                    + Add Task
                </Button>

            </div>

            <CreateWorkItemDialog
                open={open}
                onOpenChange={setOpen}
                columnId={column.id}
                boardId={boardId!}
            />

        </Card>
    );
}