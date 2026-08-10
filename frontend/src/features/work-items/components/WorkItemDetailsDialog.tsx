import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useWorkItem } from "../hooks/useWorkItem";
import { useEditWorkItem } from "../hooks/useEditWorkItem";
import { useRenameWorkItem } from "../hooks/useRenameWorkItem";
import { useArchiveWorkItem } from "../hooks/useArchiveWorkItem";
import { useRestoreWorkItem } from "../hooks/useRestoreWorkItem";
import { useOrganizationUsers } from "../hooks/useOrganizationUsers";
import { useAssignWorkItem } from "../hooks/useAssignWorkItem";
import { useUnassignWorkItem } from "../hooks/useUnassignWorkItem";
import { useCompleteWorkItem } from "../hooks/useCompleteWorkItem";
import { useBlockWorkItem } from "../hooks/useBlockWorkItem";
import { useActivateWorkItem } from "../hooks/useActivateWorkItem";

import {
    editWorkItemSchema,
} from "../schemas/editWorkItem.schema";

import {
    renameWorkItemSchema,
} from "../schemas/renameWorkItem.schema";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workItemId: string | null;
};

type WorkItemForm = {
    title: string;
    description?: string;
    priority: number;
    dueDate?: string;
    assigneeId: string;
};

function formatDateForInput(
    dueDate?: string | null
) {
    if (!dueDate) {
        return "";
    }

    const date = new Date(dueDate);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const year =
        date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export default function WorkItemDetailsDialog({
    open,
    onOpenChange,
    workItemId,
}: Props) {
    const {
        data: workItem,
        isLoading,
        isError,
    } = useWorkItem(
        workItemId ?? ""
    );

    const editMutation =
        useEditWorkItem();

    const renameMutation =
        useRenameWorkItem();

    const archiveMutation =
        useArchiveWorkItem();

    const restoreMutation =
        useRestoreWorkItem();

    const completeMutation =
        useCompleteWorkItem();

    const blockMutation =
        useBlockWorkItem();

    const activateMutation =
        useActivateWorkItem();

    const {
        data: users = [],
        isLoading: usersLoading,
        isError: usersError,
    } = useOrganizationUsers();

    const assignMutation =
        useAssignWorkItem();

    const unassignMutation =
        useUnassignWorkItem();

    const {
        register,
        handleSubmit,
        reset,
        formState: {
            errors,
        },
    } = useForm<WorkItemForm>({
        defaultValues: {
            title: "",
            description: "",
            priority: 2,
            dueDate: "",
            assigneeId: "",
        },
    });

    /*
     * ========================================
     * POPULATE FORM
     * ========================================
     */

    useEffect(() => {
        if (!workItem) {
            return;
        }

        reset({
            title:
                workItem.title,

            description:
                workItem.description ?? "",

            priority:
                Number(workItem.priority),

            dueDate:
                formatDateForInput(
                    workItem.dueDate
                ),

            assigneeId:
                workItem.assigneeId ?? "",
        });
    }, [
        workItem,
        reset,
    ]);

    /*
     * ========================================
     * SAVING STATE
     * ========================================
     */

    const isSaving =
        editMutation.isPending ||
        renameMutation.isPending ||
        archiveMutation.isPending ||
        restoreMutation.isPending ||
        assignMutation.isPending ||
        unassignMutation.isPending ||
        completeMutation.isPending ||
        blockMutation.isPending ||
        activateMutation.isPending;

    /*
     * ========================================
     * FORM SUBMIT
     * ========================================
     */

    const onSubmit = async (
        values: WorkItemForm
    ) => {
        if (!workItemId || !workItem) {
            return;
        }

        const title =
            values.title.trim();

        const description =
            values.description?.trim() ??
            "";

        /*
         * ========================================
         * DETERMINE CHANGES
         * ========================================
         */

        const originalDueDate =
            formatDateForInput(
                workItem.dueDate
            );

        const newDueDate =
            values.dueDate ?? "";

        const originalPriority =
            Number(
                workItem.priority
            );

        const newPriority =
            Number(
                values.priority
            );

        const originalDescription =
            workItem.description ??
            "";

        const currentAssigneeId =
            workItem.assigneeId ??
            "";

        const newAssigneeId =
            values.assigneeId ?? "";

        const titleChanged =
            title !==
            workItem.title;

        const descriptionChanged =
            description !==
            originalDescription;

        const priorityChanged =
            newPriority !==
            originalPriority;

        const dueDateChanged =
            newDueDate !==
            originalDueDate;

        const assigneeChanged =
            newAssigneeId !==
            currentAssigneeId;

        /*
         * ========================================
         * TITLE VALIDATION
         * ========================================
         */

        const titleValidation =
            renameWorkItemSchema.safeParse({
                title,
            });

        if (!titleValidation.success) {
            toast.error(
                titleValidation.error
                    .issues[0]?.message ??
                    "Invalid title."
            );

            return;
        }

        try {
            /*
             * ========================================
             * TITLE
             * ========================================
             */

            if (titleChanged) {
                await renameMutation.mutateAsync({
                    id: workItemId,

                    data: {
                        title,
                    },
                });
            }

            /*
             * ========================================
             * DESCRIPTION / PRIORITY / DUE DATE
             * ========================================
             */

            const otherFieldsChanged =
                descriptionChanged ||
                priorityChanged ||
                dueDateChanged;

            if (otherFieldsChanged) {
                const editValidation =
                    editWorkItemSchema.safeParse({
                        description,
                        priority:
                            newPriority,
                        dueDate:
                            newDueDate,
                    });

                if (
                    !editValidation.success
                ) {
                    const nonPriorityErrors =
                        editValidation.error.issues.filter(
                            (issue) =>
                                issue.path[0] !==
                                "priority"
                        );

                    const priorityErrors =
                        editValidation.error.issues.filter(
                            (issue) =>
                                issue.path[0] ===
                                "priority"
                        );

                    if (
                        nonPriorityErrors.length >
                        0
                    ) {
                        toast.error(
                            nonPriorityErrors[0]
                                ?.message ??
                                "Invalid work item details."
                        );

                        return;
                    }

                    if (
                        priorityChanged &&
                        priorityErrors.length >
                            0
                    ) {
                        toast.error(
                            priorityErrors[0]
                                ?.message ??
                                "Invalid priority."
                        );

                        return;
                    }
                }

                await editMutation.mutateAsync({
                    id: workItemId,

                    data: {
                        description:
                            description ||
                            undefined,

                        priority:
                            newPriority,

                        dueDate:
                            newDueDate ||
                            null,
                    },
                });
            }

            /*
             * ========================================
             * ASSIGNEE
             * ========================================
             */

            if (assigneeChanged) {
                if (newAssigneeId) {
                    await assignMutation.mutateAsync({
                        workItemId,

                        userId:
                            newAssigneeId,
                    });
                } else {
                    await unassignMutation.mutateAsync(
                        workItemId
                    );
                }
            }

            /*
             * ========================================
             * SUCCESS
             * ========================================
             */

            toast.success(
                "Work Item updated successfully."
            );

            onOpenChange(false);
        } catch (error) {
            console.error(
                "Failed to update Work Item:",
                error
            );

            toast.error(
                "Failed to update Work Item."
            );
        }
    };

    /*
     * ========================================
     * ARCHIVE
     * ========================================
     */

    const handleArchive = async () => {
        if (!workItemId) {
            return;
        }

        try {
            await archiveMutation.mutateAsync(
                workItemId
            );

            toast.success(
                "Work Item archived."
            );

            onOpenChange(false);
        } catch (error) {
            console.error(
                "Failed to archive Work Item:",
                error
            );

            toast.error(
                "Failed to archive Work Item."
            );
        }
    };

    /*
     * ========================================
     * RESTORE
     * ========================================
     */

    const handleRestore = async () => {
        if (!workItemId) {
            return;
        }

        try {
            await restoreMutation.mutateAsync(
                workItemId
            );

            toast.success(
                "Work Item restored."
            );

            onOpenChange(false);
        } catch (error) {
            console.error(
                "Failed to restore Work Item:",
                error
            );

            toast.error(
                "Failed to restore Work Item."
            );
        }
    };

    /*
     * ========================================
     * COMPLETE
     * ========================================
     */

    const handleComplete = async () => {
        if (!workItemId) {
            return;
        }

        try {
            await completeMutation.mutateAsync(
                workItemId
            );

            toast.success(
                "Work Item completed."
            );

            onOpenChange(false);
        } catch (error) {
            console.error(
                "Failed to complete Work Item:",
                error
            );

            toast.error(
                "Failed to complete Work Item."
            );
        }
    };

    /*
     * ========================================
     * BLOCK
     * ========================================
     */

    const handleBlock = async () => {
        if (!workItemId) {
            return;
        }

        try {
            await blockMutation.mutateAsync(
                workItemId
            );

            toast.success(
                "Work Item blocked."
            );

            onOpenChange(false);
        } catch (error) {
            console.error(
                "Failed to block Work Item:",
                error
            );

            toast.error(
                "Failed to block Work Item."
            );
        }
    };

    /*
     * ========================================
     * ACTIVATE
     * ========================================
     */

    const handleActivate = async () => {
        if (!workItemId) {
            return;
        }

        try {
            await activateMutation.mutateAsync(
                workItemId
            );

            toast.success(
                "Work Item activated."
            );

            onOpenChange(false);
        } catch (error) {
            console.error(
                "Failed to activate Work Item:",
                error
            );

            toast.error(
                "Failed to activate Work Item."
            );
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={
                onOpenChange
            }
        >
            <DialogContent className="sm:max-w-lg">

                <DialogHeader>
                    <DialogTitle>
                        Edit Work Item
                    </DialogTitle>

                    <DialogDescription>
                        Update the work item details.
                    </DialogDescription>
                </DialogHeader>

                {isLoading && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        Loading...
                    </div>
                )}

                {isError && (
                    <div className="py-8 text-center text-sm text-red-500">
                        Failed to load work item.
                    </div>
                )}

                {workItem &&
                    !isLoading &&
                    !isError && (
                        <form
                            onSubmit={handleSubmit(
                                onSubmit
                            )}
                            className="space-y-5"
                        >

                            {/* =========================
                                TITLE
                            ========================== */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Title
                                </label>

                                <Input
                                    {...register(
                                        "title"
                                    )}
                                />

                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {
                                            errors
                                                .title
                                                .message
                                        }
                                    </p>
                                )}
                            </div>

                            {/* =========================
                                DESCRIPTION
                            ========================== */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Description
                                </label>

                                <Textarea
                                    rows={4}
                                    {...register(
                                        "description"
                                    )}
                                />

                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {
                                            errors
                                                .description
                                                .message
                                        }
                                    </p>
                                )}
                            </div>

                            {/* =========================
                                PRIORITY
                            ========================== */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Priority
                                </label>

                                <select
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    {...register(
                                        "priority",
                                        {
                                            valueAsNumber:
                                                true,
                                        }
                                    )}
                                >
                                    <option value={1}>
                                        P1
                                    </option>

                                    <option value={2}>
                                        P2
                                    </option>

                                    <option value={3}>
                                        P3
                                    </option>

                                    <option value={4}>
                                        P4
                                    </option>

                                    <option value={5}>
                                        P5
                                    </option>

                                    <option value={6}>
                                        P6
                                    </option>

                                    <option value={7}>
                                        P7
                                    </option>

                                    <option value={8}>
                                        P8
                                    </option>

                                    <option value={9}>
                                        P9
                                    </option>

                                    <option value={10}>
                                        P10
                                    </option>
                                </select>

                                {errors.priority && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {
                                            errors
                                                .priority
                                                .message
                                        }
                                    </p>
                                )}
                            </div>

                            {/* =========================
                                ASSIGNEE
                            ========================== */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Assignee
                                </label>

                                {usersLoading ? (
                                    <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
                                        Loading members...
                                    </div>
                                ) : usersError ? (
                                    <div className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-500">
                                        Failed to load members.
                                    </div>
                                ) : (
                                    <select
                                        className="
                                            w-full
                                            rounded-md
                                            border
                                            bg-background
                                            px-3
                                            py-2
                                            text-sm
                                            focus:outline-none
                                            focus:ring-2
                                            focus:ring-ring
                                        "
                                        {...register(
                                            "assigneeId"
                                        )}
                                        disabled={
                                            isSaving
                                        }
                                    >
                                        <option value="">
                                            Unassigned
                                        </option>

                                        {users.map(
                                            (
                                                user
                                            ) => (
                                                <option
                                                    key={
                                                        user.id
                                                    }
                                                    value={
                                                        user.id
                                                    }
                                                >
                                                    {
                                                        user.fullName
                                                    }
                                                    {user.email
                                                        ? ` (${user.email})`
                                                        : ""}
                                                </option>
                                            )
                                        )}
                                    </select>
                                )}

                                {errors.assigneeId && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {
                                            errors
                                                .assigneeId
                                                .message
                                        }
                                    </p>
                                )}
                            </div>

                            {/* =========================
                                DUE DATE
                            ========================== */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Due Date
                                </label>

                                <Input
                                    type="date"
                                    {...register(
                                        "dueDate"
                                    )}
                                />

                                {errors.dueDate && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {
                                            errors
                                                .dueDate
                                                .message
                                        }
                                    </p>
                                )}
                            </div>

                            {/* =========================
                                STATUS
                            ========================== */}

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Status
                                </label>

                                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                                    {workItem.status === 1 &&
                                        "Active"}

                                    {workItem.status === 2 &&
                                        "Completed"}

                                    {workItem.status === 3 &&
                                        "Blocked"}
                                </div>
                            </div>

                            {/* =========================
                                ACTIONS
                            ========================== */}

                            <div className="flex items-center justify-between gap-4 border-t pt-4">

                                {/* =========================
                                    WORK ITEM ACTIONS
                                ========================== */}

                                <div className="flex items-center gap-2">

                                    {!workItem.isArchived &&
                                        workItem.status !== 2 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                                                onClick={
                                                    handleComplete
                                                }
                                                disabled={
                                                    isSaving
                                                }
                                            >
                                                {completeMutation.isPending
                                                    ? "Completing..."
                                                    : "Complete"}
                                            </Button>
                                        )}

                                    {!workItem.isArchived &&
                                        workItem.status !== 3 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                                                onClick={
                                                    handleBlock
                                                }
                                                disabled={
                                                    isSaving
                                                }
                                            >
                                                {blockMutation.isPending
                                                    ? "Blocking..."
                                                    : "Block"}
                                            </Button>
                                        )}

                                    {!workItem.isArchived &&
                                        workItem.status !== 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                                                onClick={
                                                    handleActivate
                                                }
                                                disabled={
                                                    isSaving
                                                }
                                            >
                                                {activateMutation.isPending
                                                    ? "Activating..."
                                                    : "Activate"}
                                            </Button>
                                        )}

                                    {workItem.isArchived ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                                            onClick={
                                                handleRestore
                                            }
                                            disabled={
                                                isSaving
                                            }
                                        >
                                            {restoreMutation.isPending
                                                ? "Restoring..."
                                                : "Restore"}
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={
                                                handleArchive
                                            }
                                            disabled={
                                                isSaving
                                            }
                                        >
                                            {archiveMutation.isPending
                                                ? "Archiving..."
                                                : "Archive"}
                                        </Button>
                                    )}

                                </div>

                                {/* =========================
                                    FORM ACTIONS
                                ========================== */}

                                <div className="flex items-center gap-2">

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            onOpenChange(
                                                false
                                            )
                                        }
                                        disabled={
                                            isSaving
                                        }
                                    >
                                        Cancel
                                    </Button>

                                    {!workItem.isArchived && (
                                        <Button
                                            type="submit"
                                            disabled={
                                                isSaving ||
                                                usersLoading ||
                                                usersError
                                            }
                                        >
                                            {isSaving
                                                ? "Saving..."
                                                : "Save Changes"}
                                        </Button>
                                    )}

                                </div>

                            </div>

                        </form>
                    )}

            </DialogContent>
        </Dialog>
    );
}