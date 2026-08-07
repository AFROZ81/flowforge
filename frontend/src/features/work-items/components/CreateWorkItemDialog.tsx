import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
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
        formState: { errors },
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

    const onSubmit = async (values: CreateWorkItemForm) => {
        try {
            await mutation.mutateAsync({
                columnId: values.columnId,
                title: values.title,
                description: values.description || undefined,
                priority: values.priority,
                dueDate: values.dueDate || undefined,
            });

            toast.success("Task created successfully");

            await queryClient.invalidateQueries({
                queryKey: ["board-details", boardId],
            });

            reset();

            onOpenChange(false);
        } catch {
            toast.error("Failed to create task");
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-lg">

                <DialogHeader>
                    <DialogTitle>Create Task</DialogTitle>

                    <DialogDescription>
                        Create a new work item.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                >

                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Title
                        </label>

                        <Input
                            {...register("title")}
                        />

                        {errors.title && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.title.message}
                            </p>
                        )}

                    </div>

                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Description
                        </label>

                        <Textarea
                            rows={4}
                            {...register("description")}
                        />

                    </div>

                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Priority
                        </label>

                        <select
                            className="w-full rounded-md border px-3 py-2"
                            {...register("priority", {
                                valueAsNumber: true,
                            })}
                        >
                            <option value={1}>Low</option>
                            <option value={2}>Medium</option>
                            <option value={3}>High</option>
                            <option value={4}>Critical</option>
                        </select>

                    </div>

                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Due Date
                        </label>

                        <Input
                            type="date"
                            {...register("dueDate")}
                        />

                    </div>

                    <div className="flex justify-end gap-2">

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                onOpenChange(false)
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending
                                ? "Creating..."
                                : "Create Task"}
                        </Button>

                    </div>

                </form>

            </DialogContent>
        </Dialog>
    );
}