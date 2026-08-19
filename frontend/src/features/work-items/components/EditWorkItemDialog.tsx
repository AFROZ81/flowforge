import {
    useEffect,
} from "react";

import {
    useForm,
} from "react-hook-form";

import {
    toast,
} from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Button,
} from "@/components/ui/button";

import {
    Input,
} from "@/components/ui/input";

import {
    Textarea,
} from "@/components/ui/textarea";

import {
    useEditWorkItem,
} from "../hooks/useEditWorkItem";

import {
    useRenameWorkItem,
} from "../hooks/useRenameWorkItem";

import {
    useOrganizationUsers,
} from "../hooks/useOrganizationUsers";

import {
    useAssignWorkItem,
} from "../hooks/useAssignWorkItem";

import {
    useUnassignWorkItem,
} from "../hooks/useUnassignWorkItem";

import {
    editWorkItemSchema,
} from "../schemas/editWorkItem.schema";

import {
    renameWorkItemSchema,
} from "../schemas/renameWorkItem.schema";

import type { WorkItem } from "../types/workItem";

type Props = {
    open: boolean;
    onOpenChange: (
        open: boolean
    ) => void;

    workItem: WorkItem | null;
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

    const date =
        new Date(dueDate);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export default function EditWorkItemDialog({
    open,
    onOpenChange,
    workItem,
}: Props) {
    const editMutation =
        useEditWorkItem();

    const renameMutation =
        useRenameWorkItem();

    const {
        data: users = [],
        isLoading: usersLoading,
        isError: usersError,
    } =
        useOrganizationUsers();

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
    } =
        useForm<WorkItemForm>({
            defaultValues: {
                title: "",
                description: "",
                priority: 2,
                dueDate: "",
                assigneeId: "",
            },
        });

    useEffect(() => {
        if (!workItem) {
            return;
        }

        reset({
            title:
                workItem.title,

            description:
                workItem.description ??
                "",

            priority:
                Number(
                    workItem.priority
                ),

            dueDate:
                formatDateForInput(
                    workItem.dueDate
                ),

            assigneeId:
                workItem.assigneeId ??
                "",
        });
    }, [
        workItem,
        reset,
    ]);

    const isSaving =
        editMutation.isPending ||
        renameMutation.isPending ||
        assignMutation.isPending ||
        unassignMutation.isPending;

    const onSubmit =
        async (
            values: WorkItemForm
        ) => {
            if (!workItem) {
                return;
            }

            const title =
                values.title.trim();

            const description =
                values.description?.trim() ??
                "";

            const originalDueDate =
                formatDateForInput(
                    workItem.dueDate
                );

            const originalPriority =
                Number(
                    workItem.priority
                );

            const newPriority =
                Number(
                    values.priority
                );

            const newDueDate =
                values.dueDate ?? "";

            const originalDescription =
                workItem.description ??
                "";

            const currentAssigneeId =
                workItem.assigneeId ??
                "";

            const newAssigneeId =
                values.assigneeId ??
                "";

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

            const titleValidation =
                renameWorkItemSchema.safeParse({
                    title,
                });

            if (
                !titleValidation.success
            ) {
                toast.error(
                    titleValidation
                        .error
                        .issues[0]
                        ?.message ??
                        "Invalid title."
                );

                return;
            }

            try {
                if (titleChanged) {
                    await renameMutation.mutateAsync({
                        id:
                            workItem.id,

                        data: {
                            title,
                        },
                    });
                }

                const otherFieldsChanged =
                    descriptionChanged ||
                    priorityChanged ||
                    dueDateChanged;

                if (
                    otherFieldsChanged
                ) {
                    const validation =
                        editWorkItemSchema.safeParse({
                            description,
                            priority:
                                newPriority,
                            dueDate:
                                newDueDate,
                        });

                    if (
                        !validation.success
                    ) {
                        const issue =
                            validation
                                .error
                                .issues[0];

                        toast.error(
                            issue?.message ??
                            "Invalid work item details."
                        );

                        return;
                    }

                    await editMutation.mutateAsync({
                        id:
                            workItem.id,

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

                if (
                    assigneeChanged
                ) {
                    if (
                        newAssigneeId
                    ) {
                        await assignMutation.mutateAsync({
                            workItemId:
                                workItem.id,

                            userId:
                                newAssigneeId,
                        });
                    } else {
                        await unassignMutation.mutateAsync(
                            workItem.id
                        );
                    }
                }

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

    return (
        <Dialog
            open={open}
            onOpenChange={
                onOpenChange
            }
        >
            <DialogContent
                className="
                    max-h-[90vh]
                    overflow-y-auto
                    sm:max-w-md
                "
            >
                <DialogHeader>
                    <DialogTitle>
                        Edit Work Item
                    </DialogTitle>

                    <DialogDescription>
                        Update the work item details.
                    </DialogDescription>
                </DialogHeader>

                {workItem && (
                    <form
                        onSubmit={
                            handleSubmit(
                                onSubmit
                            )
                        }
                        className="
                            space-y-4
                        "
                    >
                        {/* TITLE */}

                        <div>
                            <label className="
                                mb-1.5
                                block
                                text-sm
                                font-medium
                            ">
                                Title
                            </label>

                            <Input
                                {...register(
                                    "title"
                                )}
                                disabled={
                                    isSaving
                                }
                            />

                            {errors.title && (
                                <p className="
                                    mt-1
                                    text-xs
                                    text-red-500
                                ">
                                    {
                                        errors
                                            .title
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        {/* DESCRIPTION */}

                        <div>
                            <label className="
                                mb-1.5
                                block
                                text-sm
                                font-medium
                            ">
                                Description
                            </label>

                            <Textarea
                                rows={4}
                                {...register(
                                    "description"
                                )}
                                disabled={
                                    isSaving
                                }
                            />
                        </div>

                        {/* PRIORITY */}

                        <div>
                            <label className="
                                mb-1.5
                                block
                                text-sm
                                font-medium
                            ">
                                Priority
                            </label>

                            <select
                                className="
                                    w-full
                                    rounded-md
                                    border
                                    bg-background
                                    px-3
                                    py-2
                                    text-sm
                                "
                                {...register(
                                    "priority",
                                    {
                                        valueAsNumber:
                                            true,
                                    }
                                )}
                                disabled={
                                    isSaving
                                }
                            >
                                {Array.from(
                                    {
                                        length: 4,
                                    },
                                    (
                                        _,
                                        index
                                    ) => (
                                        <option
                                            key={
                                                index +
                                                1
                                            }
                                            value={
                                                index +
                                                1
                                            }
                                        >
                                            P
                                            {index +
                                                1}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* ASSIGNEE */}

                        <div>
                            <label className="
                                mb-1.5
                                block
                                text-sm
                                font-medium
                            ">
                                Assignee
                            </label>

                            {usersLoading ? (
                                <div className="
                                    rounded-md
                                    border
                                    px-3
                                    py-2
                                    text-sm
                                    text-muted-foreground
                                ">
                                    Loading members...
                                </div>
                            ) : usersError ? (
                                <div className="
                                    rounded-md
                                    border
                                    border-red-200
                                    px-3
                                    py-2
                                    text-sm
                                    text-red-500
                                ">
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
                        </div>

                        {/* DUE DATE */}

                        <div>
                            <label className="
                                mb-1.5
                                block
                                text-sm
                                font-medium
                            ">
                                Due Date
                            </label>

                            <Input
                                type="date"
                                {...register(
                                    "dueDate"
                                )}
                                disabled={
                                    isSaving
                                }
                            />
                        </div>

                        {/* ACTIONS */}

                        <div className="
                            flex
                            justify-end
                            gap-2
                            border-t
                            pt-4
                        ">
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
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}