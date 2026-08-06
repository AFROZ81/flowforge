import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
    createProjectSchema,
    type CreateProjectForm,
} from "../schemas/createProject.schema";

import { useCreateProject } from "../hooks/useCreateProject";

type Props = {
    open: boolean;
    onOpenChange: (value: boolean) => void;
};

const COLORS = [
    "#2563EB",
    "#7C3AED",
    "#16A34A",
    "#EA580C",
    "#DC2626",
    "#0891B2",
];

const ICONS = [
    "🚀",
    "📁",
    "📦",
    "💻",
    "📱",
    "🌐",
    "📊",
    "⚡",
];

export default function CreateProjectDialog({
    open,
    onOpenChange,
}: Props) {

    const mutation = useCreateProject();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: {
            errors,
        },
    } = useForm<CreateProjectForm>({
        resolver: zodResolver(createProjectSchema),

        defaultValues: {
            name: "",
            key: "",
            description: "",
            color: COLORS[0],
            icon: ICONS[0],
        },
    });

    useEffect(() => {

        if (!open) {
            reset();
        }

    }, [open, reset]);

    const selectedColor = watch("color");

    const selectedIcon = watch("icon");

    async function onSubmit(
        values: CreateProjectForm
    ) {

        try {

            await mutation.mutateAsync(values);

            toast.success(
                "Project created successfully"
            );

            onOpenChange(false);

        } catch {

            toast.error(
                "Unable to create project"
            );

        }

    }

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >

            <DialogContent className="sm:max-w-xl">

                <DialogHeader>

                    <DialogTitle>
                        Create Project
                    </DialogTitle>

                    <DialogDescription>
                        Create a new project.
                    </DialogDescription>

                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                >

                    <div>

                        <Input
                            placeholder="Project Name"
                            {...register("name")}
                        />

                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.name.message}
                            </p>
                        )}

                    </div>

                    <div>

                        <Input
                            placeholder="Project Key"
                            {...register("key")}
                        />

                        {errors.key && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.key.message}
                            </p>
                        )}

                    </div>

                    <Textarea
                        placeholder="Description"
                        {...register("description")}
                    />

                    <div>

                        <p className="mb-2 text-sm font-medium">
                            Color
                        </p>

                        <div className="flex gap-3">

                            {COLORS.map(color => (

                                <button
                                    key={color}
                                    type="button"
                                    onClick={() =>
                                        setValue("color", color)
                                    }
                                    className={`h-8 w-8 rounded-full border-2 ${
                                        selectedColor === color
                                            ? "border-black"
                                            : "border-transparent"
                                    }`}
                                    style={{
                                        backgroundColor: color,
                                    }}
                                />

                            ))}

                        </div>

                    </div>

                    <div>

                        <p className="mb-2 text-sm font-medium">
                            Icon
                        </p>

                        <div className="grid grid-cols-4 gap-2">

                            {ICONS.map(icon => (

                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() =>
                                        setValue("icon", icon)
                                    }
                                    className={`rounded-xl border p-3 text-2xl transition ${
                                        selectedIcon === icon
                                            ? "border-blue-600 bg-blue-50"
                                            : ""
                                    }`}
                                >
                                    {icon}
                                </button>

                            ))}

                        </div>

                    </div>

                    <div className="flex justify-end gap-3">

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

                            {mutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}

                            {mutation.isPending
                                ? "Creating..."
                                : "Create Project"}

                        </Button>

                    </div>

                </form>

            </DialogContent>

        </Dialog>
    );
}