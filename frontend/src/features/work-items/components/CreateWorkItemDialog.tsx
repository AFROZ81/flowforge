import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { NativeSelect } from "@/components/ui/native-select";
import { normalizeError } from "@/lib/errors";

import {
    createWorkItemSchema,
    type CreateWorkItemForm,
} from "../schemas/createWorkItem.schema";

import { useCreateWorkItem } from "../hooks/useCreateWorkItem";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    columnId: string;
    boardId: string;
};

/** Mirrors WorkItemPriority on the server. */
const PRIORITIES = [
    { value: 1, label: "Low" },
    { value: 2, label: "Medium" },
    { value: 3, label: "High" },
    { value: 4, label: "Critical" },
];

export default function CreateWorkItemDialog({
    open,
    onOpenChange,
    columnId,
    boardId,
}: Props) {
    const queryClient = useQueryClient();

    const mutation = useCreateWorkItem();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CreateWorkItemForm>({
        resolver: zodResolver(createWorkItemSchema),
        defaultValues: {
            columnId,
            title: "",
            description: "",
            priority: 2,
            dueDate: "",
        },
    });

    useEffect(() => {
        setValue("columnId", columnId);
    }, [columnId, setValue]);

    const busy = mutation.isPending || isSubmitting;

    const onSubmit = async (values: CreateWorkItemForm) => {
        try {
            await mutation.mutateAsync({
                columnId: values.columnId,
                title: values.title,
                description: values.description || undefined,
                priority: values.priority,
                dueDate: values.dueDate || undefined,
            });

            toast.success("Work item created", {
                description: values.title,
            });

            await queryClient.invalidateQueries({
                queryKey: ["board-details", boardId],
            });

            reset();
            onOpenChange(false);
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: "We couldn't create that work item",
                description: "Check the title and try again.",
            });

            toast.error(title, { description });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>New work item</DialogTitle>

                    <DialogDescription>
                        It lands at the top of this column.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <DialogBody className="-mx-4 space-y-5 px-4 sm:mx-0 sm:px-0">
                        <FormField
                            label="Title"
                            htmlFor="work-item-title"
                            required
                            error={errors.title?.message}
                        >
                            {(aria) => (
                                <Input
                                    {...aria}
                                    placeholder="Short, specific summary"
                                    maxLength={200}
                                    autoComplete="off"
                                    disabled={busy}
                                    {...register("title")}
                                />
                            )}
                        </FormField>

                        <FormField
                            label="Description"
                            htmlFor="work-item-description"
                            optional
                            hint="Context worth keeping after the conversation ends."
                            error={errors.description?.message}
                        >
                            {(aria) => (
                                <Textarea
                                    {...aria}
                                    rows={4}
                                    maxLength={2000}
                                    placeholder="What needs to happen?"
                                    disabled={busy}
                                    {...register("description")}
                                />
                            )}
                        </FormField>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <FormField
                                label="Priority"
                                htmlFor="work-item-priority"
                            >
                                {(aria) => (
                                    <NativeSelect
                                        {...aria}
                                        disabled={busy}
                                        {...register("priority", {
                                            valueAsNumber: true,
                                        })}
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
                                htmlFor="work-item-due-date"
                                optional
                            >
                                {(aria) => (
                                    <Input
                                        {...aria}
                                        type="date"
                                        disabled={busy}
                                        {...register("dueDate")}
                                    />
                                )}
                            </FormField>
                        </div>
                    </DialogBody>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={busy}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" disabled={busy}>
                            {busy && <Loader2 className="animate-spin" />}
                            {busy ? "Creating…" : "Create work item"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
