import { useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useArchivedWorkItems } from "../hooks/useArchivedWorkItems";
import { useRestoreWorkItem } from "../hooks/useRestoreWorkItem";

type Props = {
    columnId: string;
};

export default function ArchivedWorkItems({
    columnId,
}: Props) {
    const [open, setOpen] =
        useState(false);

    const {
        data: workItems = [],
        isLoading,
    } = useArchivedWorkItems(
        columnId
    );

    const restoreMutation =
        useRestoreWorkItem();

    const archivedItems =
        workItems.filter(
            (item) =>
                item.isArchived
        );

    const handleRestore = async (
        id: string
    ) => {
        try {
            await restoreMutation.mutateAsync(
                id
            );

            toast.success(
                "Work Item restored."
            );
        } catch {
            toast.error(
                "Failed to restore Work Item."
            );
        }
    };

    return (
        <div className="border-t">

            <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/50"
                onClick={() =>
                    setOpen((value) => !value)
                }
            >
                <span>
                    Archived
                </span>

                <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    {archivedItems.length}
                </span>
            </button>

            {open && (
                <div className="space-y-3 p-4">

                    {isLoading && (
                        <p className="text-center text-sm text-muted-foreground">
                            Loading archived tasks...
                        </p>
                    )}

                    {!isLoading &&
                        archivedItems.length ===
                            0 && (
                            <p className="text-center text-sm text-muted-foreground">
                                No archived tasks.
                            </p>
                        )}

                    {!isLoading &&
                        archivedItems.map(
                            (item) => (
                                <Card
                                    key={item.id}
                                    className="rounded-xl p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">

                                        <div className="min-w-0">

                                            <h4 className="font-medium">
                                                {
                                                    item.title
                                                }
                                            </h4>

                                            {item.description && (
                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                    {
                                                        item.description
                                                    }
                                                </p>
                                            )}

                                        </div>

                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                handleRestore(
                                                    item.id
                                                )
                                            }
                                            disabled={
                                                restoreMutation.isPending
                                            }
                                        >
                                            Restore
                                        </Button>

                                    </div>
                                </Card>
                            )
                        )}

                </div>
            )}

        </div>
    );
}