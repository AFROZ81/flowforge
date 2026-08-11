import {
    useEffect,
    useState,
} from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useChecklists } from "../hooks/useChecklists";
import { useChecklistProgress } from "../hooks/useChecklistProgress";
import { useCreateChecklist } from "../hooks/useCreateChecklist";
import { useUpdateChecklist } from "../hooks/useUpdateChecklist";
import { useDeleteChecklist } from "../hooks/useDeleteChecklist";
import { useCompleteChecklist } from "../hooks/useCompleteChecklist";
import { useUncompleteChecklist } from "../hooks/useUncompleteChecklist";
import { useReorderChecklists } from "../hooks/useReorderChecklists";

import type {
    ChecklistItem,
} from "../types/checklist";

type Props = {
    workItemId: string;
    disabled?: boolean;
};

export default function ChecklistSection({
    workItemId,
    disabled = false,
}: Props) {
    const {
        data: checklistItems = [],
        isLoading,
        isError,
    } = useChecklists(workItemId);

    const {
        data: progress,
    } = useChecklistProgress(
        workItemId
    );

    const createMutation =
        useCreateChecklist();

    const updateMutation =
        useUpdateChecklist();

    const deleteMutation =
        useDeleteChecklist();

    const completeMutation =
        useCompleteChecklist();

    const uncompleteMutation =
        useUncompleteChecklist();

    const reorderMutation =
        useReorderChecklists();

    const [
        items,
        setItems,
    ] = useState<ChecklistItem[]>([]);

    const [
        newTitle,
        setNewTitle,
    ] = useState("");

    const [
        editingId,
        setEditingId,
    ] = useState<string | null>(
        null
    );

    const [
        editingTitle,
        setEditingTitle,
    ] = useState("");

    const [
        draggingId,
        setDraggingId,
    ] = useState<string | null>(
        null
    );

    useEffect(() => {
        setItems(
            [...checklistItems].sort(
                (a, b) =>
                    a.order - b.order
            )
        );
    }, [checklistItems]);

    const isMutating =
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending ||
        completeMutation.isPending ||
        uncompleteMutation.isPending ||
        reorderMutation.isPending;

    const handleAdd = async () => {
        const title =
            newTitle.trim();

        if (!title) {
            toast.error(
                "Checklist title is required."
            );
            return;
        }

        try {
            await createMutation.mutateAsync({
                workItemId,
                title,
            });

            setNewTitle("");

            toast.success(
                "Checklist item added."
            );
        } catch (error) {
            console.error(
                "Failed to add checklist item:",
                error
            );

            toast.error(
                "Failed to add checklist item."
            );
        }
    };

    const handleToggle = async (
        item: ChecklistItem
    ) => {
        if (disabled) {
            return;
        }

        try {
            if (item.isCompleted) {
                await uncompleteMutation.mutateAsync(
                    {
                        workItemId,
                        checklistItemId:
                            item.id,
                    }
                );
            } else {
                await completeMutation.mutateAsync(
                    {
                        workItemId,
                        checklistItemId:
                            item.id,
                    }
                );
            }
        } catch (error) {
            console.error(
                "Failed to update checklist status:",
                error
            );

            toast.error(
                "Failed to update checklist item."
            );
        }
    };

    const startEditing = (
        item: ChecklistItem
    ) => {
        setEditingId(item.id);
        setEditingTitle(item.title);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingTitle("");
    };

    const handleUpdate = async (
        item: ChecklistItem
    ) => {
        const title =
            editingTitle.trim();

        if (!title) {
            toast.error(
                "Checklist title is required."
            );
            return;
        }

        try {
            await updateMutation.mutateAsync({
                workItemId,

                data: {
                    checklistItemId:
                        item.id,
                    title,
                },
            });

            cancelEditing();

            toast.success(
                "Checklist item updated."
            );
        } catch (error) {
            console.error(
                "Failed to update checklist item:",
                error
            );

            toast.error(
                "Failed to update checklist item."
            );
        }
    };

    const handleDelete = async (
        item: ChecklistItem
    ) => {
        if (disabled) {
            return;
        }

        try {
            await deleteMutation.mutateAsync({
                workItemId,
                checklistItemId:
                    item.id,
            });

            if (
                editingId === item.id
            ) {
                cancelEditing();
            }

            toast.success(
                "Checklist item deleted."
            );
        } catch (error) {
            console.error(
                "Failed to delete checklist item:",
                error
            );

            toast.error(
                "Failed to delete checklist item."
            );
        }
    };

    const handleDragStart = (
        itemId: string
    ) => {
        if (disabled) {
            return;
        }

        setDraggingId(itemId);
    };

    const handleDrop = async (
        targetId: string
    ) => {
        if (
            disabled ||
            !draggingId ||
            draggingId === targetId
        ) {
            return;
        }

        const currentItems = [
            ...items,
        ];

        const fromIndex =
            currentItems.findIndex(
                (item) =>
                    item.id ===
                    draggingId
            );

        const toIndex =
            currentItems.findIndex(
                (item) =>
                    item.id ===
                    targetId
            );

        if (
            fromIndex === -1 ||
            toIndex === -1
        ) {
            setDraggingId(null);
            return;
        }

        const [
            movedItem,
        ] = currentItems.splice(
            fromIndex,
            1
        );

        currentItems.splice(
            toIndex,
            0,
            movedItem
        );

        const reordered =
            currentItems.map(
                (
                    item,
                    index
                ) => ({
                    ...item,
                    order:
                        index + 1,
                })
            );

        setItems(reordered);
        setDraggingId(null);

        try {
            await reorderMutation.mutateAsync({
                workItemId,

                data: {
                    items:
                        reordered.map(
                            (
                                item
                            ) => ({
                                checklistItemId:
                                    item.id,
                                order:
                                    item.order,
                            })
                        ),
                },
            });
        } catch (error) {
            console.error(
                "Failed to reorder checklist:",
                error
            );

            toast.error(
                "Failed to reorder checklist."
            );
        }
    };

    const total =
        progress?.totalItems ??
        items.length;

    const completed =
        progress?.completedItems ??
        items.filter(
            (item) =>
                item.isCompleted
        ).length;

    const percentage =
        progress?.progressPercentage ??
        (total > 0
            ? Math.round(
                  (completed /
                      total) *
                      100
              )
            : 0);

    return (
        <section className="
            rounded-lg
            border
            bg-muted/10
            p-3
        ">

            <div className="
                mb-3
                flex
                items-center
                justify-between
                gap-3
            ">
                <div>
                    <div className="
                        flex
                        items-center
                        gap-2
                    ">
                        <h3 className="
                            text-sm
                            font-semibold
                        ">
                            Checklist
                        </h3>

                        <span className="
                            rounded-full
                            bg-muted
                            px-1.5
                            py-0.5
                            text-[10px]
                            font-medium
                        ">
                            {completed}/{total}
                        </span>
                    </div>

                    <p className="
                        mt-0.5
                        text-xs
                        text-muted-foreground
                    ">
                        {completed} of {total} completed
                    </p>
                </div>

                <span className="
                    text-xs
                    font-medium
                    text-muted-foreground
                ">
                    {percentage}%
                </span>
            </div>

            <div className="
                mb-3
                h-1.5
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
                                percentage
                            )
                        )}%`,
                    }}
                />
            </div>

            {isLoading && (
                <div className="
                    rounded-md
                    border
                    bg-background
                    px-3
                    py-4
                    text-center
                    text-xs
                    text-muted-foreground
                ">
                    Loading checklist...
                </div>
            )}

            {isError && (
                <div className="
                    rounded-md
                    border
                    border-red-200
                    bg-red-50
                    px-3
                    py-3
                    text-xs
                    text-red-600
                ">
                    Failed to load checklist.
                </div>
            )}

            {!isLoading &&
                !isError &&
                items.length === 0 && (
                    <div className="
                        rounded-md
                        border
                        border-dashed
                        bg-background
                        px-3
                        py-4
                        text-center
                        text-xs
                        text-muted-foreground
                    ">
                        No checklist items yet.
                    </div>
                )}

            {!isLoading &&
                !isError &&
                items.length > 0 && (
                    <div className="
                        space-y-2
                    ">
                        {items.map(
                            (item) => (
                                <div
                                    key={
                                        item.id
                                    }
                                    draggable={
                                        !disabled &&
                                        !isMutating
                                    }
                                    onDragStart={() =>
                                        handleDragStart(
                                            item.id
                                        )
                                    }
                                    onDragOver={(
                                        event
                                    ) => {
                                        event.preventDefault();
                                    }}
                                    onDrop={() =>
                                        handleDrop(
                                            item.id
                                        )
                                    }
                                    className={`
                                        rounded-md
                                        border
                                        bg-background
                                        p-2
                                        transition
                                        ${
                                            draggingId ===
                                            item.id
                                                ? "opacity-50"
                                                : ""
                                        }
                                    `}
                                >
                                    {editingId ===
                                    item.id ? (
                                        <div className="
                                            flex
                                            items-center
                                            gap-2
                                        ">
                                            <Input
                                                value={
                                                    editingTitle
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setEditingTitle(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                disabled={
                                                    updateMutation.isPending
                                                }
                                                autoFocus
                                                className="
                                                    h-8
                                                    text-sm
                                                "
                                                onKeyDown={(
                                                    event
                                                ) => {
                                                    if (
                                                        event.key ===
                                                        "Enter"
                                                    ) {
                                                        event.preventDefault();

                                                        void handleUpdate(
                                                            item
                                                        );
                                                    }

                                                    if (
                                                        event.key ===
                                                        "Escape"
                                                    ) {
                                                        event.preventDefault();

                                                        cancelEditing();
                                                    }
                                                }}
                                            />

                                            <Button
                                                type="button"
                                                size="sm"
                                                className="h-8"
                                                onClick={() =>
                                                    void handleUpdate(
                                                        item
                                                    )
                                                }
                                                disabled={
                                                    updateMutation.isPending
                                                }
                                            >
                                                Save
                                            </Button>

                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="h-8"
                                                onClick={
                                                    cancelEditing
                                                }
                                                disabled={
                                                    updateMutation.isPending
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="
                                            flex
                                            items-center
                                            gap-2
                                        ">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    item.isCompleted
                                                }
                                                onChange={() =>
                                                    void handleToggle(
                                                        item
                                                    )
                                                }
                                                disabled={
                                                    disabled ||
                                                    isMutating
                                                }
                                                className="
                                                    h-4
                                                    w-4
                                                    shrink-0
                                                    cursor-pointer
                                                    accent-foreground
                                                "
                                            />

                                            <span
                                                className={`
                                                    min-w-0
                                                    flex-1
                                                    text-sm
                                                    ${
                                                        item.isCompleted
                                                            ? "text-muted-foreground line-through"
                                                            : ""
                                                    }
                                                `}
                                            >
                                                {
                                                    item.title
                                                }
                                            </span>

                                            {!disabled && (
                                                <>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="
                                                            h-7
                                                            px-2
                                                            text-xs
                                                        "
                                                        onClick={() =>
                                                            startEditing(
                                                                item
                                                            )
                                                        }
                                                        disabled={
                                                            isMutating
                                                        }
                                                    >
                                                        Edit
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="
                                                            h-7
                                                            px-2
                                                            text-xs
                                                            text-red-600
                                                            hover:text-red-700
                                                        "
                                                        onClick={() =>
                                                            void handleDelete(
                                                                item
                                                            )
                                                        }
                                                        disabled={
                                                            isMutating
                                                        }
                                                    >
                                                        Delete
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                )}

            {!disabled && (
                <div className="
                    mt-3
                    flex
                    items-center
                    gap-2
                ">
                    <Input
                        value={
                            newTitle
                        }
                        onChange={(
                            event
                        ) =>
                            setNewTitle(
                                event.target.value
                            )
                        }
                        placeholder="Add checklist item..."
                        disabled={
                            isMutating
                        }
                        className="h-9"
                        onKeyDown={(
                            event
                        ) => {
                            if (
                                event.key ===
                                "Enter"
                            ) {
                                event.preventDefault();

                                void handleAdd();
                            }
                        }}
                    />

                    <Button
                        type="button"
                        size="sm"
                        className="h-9 shrink-0"
                        onClick={() =>
                            void handleAdd()
                        }
                        disabled={
                            isMutating ||
                            !newTitle.trim()
                        }
                    >
                        Add
                    </Button>
                </div>
            )}
        </section>
    );
}
