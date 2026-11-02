import {
    useEffect,
} from "react";

import {
    Loader2,
} from "lucide-react";

import {
    useForm,
} from "react-hook-form";

import {
    toast,
} from "sonner";

import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
    FormField,
} from "@/components/ui/form-field";

import {
    NativeSelect,
} from "@/components/ui/native-select";

import {
    Skeleton,
} from "@/components/ui/skeleton";

import {
    ErrorState,
} from "@/components/ui/error-state";

import {
    normalizeError,
} from "@/lib/errors";

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

import type {
    WorkItem,
} from "../types/workItem";


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


/** Mirrors WorkItemPriority on the server. */
const PRIORITIES = [
    { value: 1, label: "Low" },
    { value: 2, label: "Medium" },
    { value: 3, label: "High" },
    { value: 4, label: "Critical" },
];


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


    /*
     * ========================================
     * LOAD WORK ITEM INTO FORM
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


    /*
     * ========================================
     * SAVING STATE
     * ========================================
     */

    const isSaving =
        editMutation.isPending ||
        renameMutation.isPending ||
        assignMutation.isPending ||
        unassignMutation.isPending;


    /*
     * ========================================
     * SUBMIT
     * ========================================
     */

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
                values.dueDate ??
                "";

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


            /*
             * ====================================
             * TITLE VALIDATION
             * ====================================
             */

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

                /*
                 * ====================================
                 * RENAME
                 * ====================================
                 */

                if (
                    titleChanged
                ) {
                    await renameMutation.mutateAsync({
                        id:
                            workItem.id,

                        data: {
                            title,
                        },
                    });
                }


                /*
                 * ====================================
                 * OTHER FIELDS
                 * ====================================
                 */

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


                /*
                 * ====================================
                 * ASSIGNEE
                 * ====================================
                 */

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


                toast.success("Work item updated", {
                    description: title,
                });

                onOpenChange(false);

            } catch (error) {

                console.error(
                    "Failed to update Work Item:",
                    error
                );

                const { title: heading, description } = normalizeError(error, {
                    title: "We couldn't save those changes",
                    description: "Nothing was lost — try again.",
                });

                toast.error(heading, { description });
            }
        };


    /*
     * ========================================
     * RENDER
     * ========================================
     */

    return (
        <Dialog
            open={open}
            onOpenChange={
                onOpenChange
            }
        >

            <DialogContent
                className="
                    max-h-[92dvh] gap-0 sm:max-w-xl
                "
            >

                <DialogHeader>

                    <DialogTitle>
                        Edit work item
                    </DialogTitle>

                    <DialogDescription>
                        Only what you change is sent.
                    </DialogDescription>

                </DialogHeader>


                {workItem && (

                    <form
                        onSubmit={
                            handleSubmit(
                                onSubmit
                            )
                        }
                        className="flex min-h-0 flex-1 flex-col"
                    >

                        <DialogBody className="-mx-4 space-y-5 px-4 sm:mx-0 sm:px-0">

                        {/* =================================
                            TITLE
                        ================================== */}

                        <FormField
                            label="Title"
                            htmlFor="work-item-edit-title"
                            required
                            error={errors.title?.message}
                        >
                            {(aria) => (
                                <Input
                                    {...aria}
                                    maxLength={200}
                                    {...register("title")}
                                    disabled={isSaving}
                                />
                            )}
                        </FormField>


                        {/* =================================
                            DESCRIPTION
                        ================================== */}

                        <FormField
                            label="Description"
                            htmlFor="work-item-edit-description"
                            optional
                        >
                            {(aria) => (
                                <Textarea
                                    {...aria}
                                    rows={4}
                                    maxLength={2000}
                                    {...register("description")}
                                    disabled={isSaving}
                                />
                            )}
                        </FormField>


                        {/* =================================
                            PRIORITY + DUE DATE
                        ================================== */}

                        <div className="grid gap-5 sm:grid-cols-2">

                            <FormField
                                label="Priority"
                                htmlFor="work-item-edit-priority"
                            >
                                {(aria) => (
                                    <NativeSelect
                                        {...aria}
                                        {...register("priority", {
                                            valueAsNumber: true,
                                        })}
                                        disabled={isSaving}
                                    >
                                        {PRIORITIES.map((priority) => (
                                            <option
                                                key={priority.value}
                                                value={priority.value}
                                            >
                                                {priority.label}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                )}
                            </FormField>


                            <FormField
                                label="Due date"
                                htmlFor="work-item-edit-due-date"
                                optional
                            >
                                {(aria) => (
                                    <Input
                                        {...aria}
                                        type="date"
                                        {...register("dueDate")}
                                        disabled={isSaving}
                                    />
                                )}
                            </FormField>

                        </div>


                        {/* =================================
                            ASSIGNEE
                        ================================== */}

                        <FormField
                            label="Assignee"
                            htmlFor="work-item-edit-assignee"
                        >
                            {(aria) =>
                                usersLoading ? (
                                    <Skeleton className="h-9 w-full rounded-lg" />
                                ) : usersError ? (
                                    <ErrorState
                                        error={usersError}
                                        title="Member list unavailable"
                                        description="You can still save the other fields."
                                    />
                                ) : (
                                    <NativeSelect
                                        {...aria}
                                        {...register("assigneeId")}
                                        disabled={isSaving}
                                    >
                                        <option value="">
                                            Unassigned
                                        </option>

                                        {users.map((user) => (
                                            <option
                                                key={user.id}
                                                value={user.id}
                                            >
                                                {user.fullName}
                                                {user.email
                                                    ? ` (${user.email})`
                                                    : ""}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                )
                            }
                        </FormField>

                        </DialogBody>


                        {/* =================================
                            ACTIONS
                        ================================== */}

                        <DialogFooter>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>


                            <Button
                                type="submit"
                                disabled={
                                    isSaving ||
                                    usersLoading ||
                                    !!usersError
                                }
                            >
                                {isSaving && (
                                    <Loader2 className="animate-spin" />
                                )}
                                {isSaving ? "Saving…" : "Save changes"}
                            </Button>

                        </DialogFooter>

                    </form>

                )}

            </DialogContent>

        </Dialog>
    );
}