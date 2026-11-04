import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { ProjectMark } from "@/components/common/project-mark";
import { cn } from "@/lib/utils";
import { normalizeError } from "@/lib/errors";

import { PROJECT_COLORS } from "../constants/projectColors";
import { PROJECT_ICONS } from "../constants/projectIcons";

import {
    createProjectSchema,
    type CreateProjectForm,
} from "../schemas/createProject.schema";

import { useCreateProject } from "../hooks/useCreateProject";
import { useUpdateProject } from "../hooks/useUpdateProject";

import type { Project } from "../types/project";

type Props = {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    /** Present to edit this project, absent to create a new one. */
    project?: Project;
};

const BLANK: CreateProjectForm = {
    name: "",
    key: "",
    description: "",
    color: PROJECT_COLORS[0],
    icon: PROJECT_ICONS[0],
};

function toFormValues(project: Project): CreateProjectForm {
    return {
        name: project.name,
        key: project.key,
        description: project.description ?? "",
        color: project.color,
        icon: project.icon,
    };
}

/**
 * One form for both creating and editing.
 *
 * The two share every field, every picker and every validation rule; keeping
 * them in one file means a rule added for creation cannot be quietly skipped by
 * the edit path.
 */
export default function ProjectFormDialog({
    open,
    onOpenChange,
    project,
}: Props) {
    const isEdit = Boolean(project);

    const create = useCreateProject();
    const update = useUpdateProject();
    const pending = create.isPending || update.isPending;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<CreateProjectForm>({
        resolver: zodResolver(createProjectSchema),
        defaultValues: BLANK,
    });

    /*
     * Seeded when the dialog opens, not on mount: the same instance is asked to
     * edit different rows in turn, and a form that keeps the previous row's
     * values is how a rename lands on the wrong project.
     */
    useEffect(() => {
        if (!open) {
            reset(BLANK);
            return;
        }

        reset(project ? toFormValues(project) : BLANK);
    }, [open, project, reset]);

    const selectedColor = watch("color");
    const selectedIcon = watch("icon");
    const watchedName = watch("name");
    const watchedKey = watch("key");

    /*
     * Deriving the key from the name saves typing and can't get out of sync,
     * because the field stays editable — typing in it stops the suggestion.
     */
    const suggestKey = () => {
        if (watchedKey.trim()) return;

        const guess = watchedName
            .toUpperCase()
            .replace(/[^A-Z0-9\s]/g, "")
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => word.replace(/[^A-Z]/g, "").slice(0, 1))
            .join("")
            .slice(0, 8);

        if (guess.length >= 2) setValue("key", guess, { shouldValidate: true });
    };

    async function onSubmit(values: CreateProjectForm) {
        try {
            if (project) {
                await update.mutateAsync({
                    ...values,
                    projectId: project.id,
                });

                toast.success("Project updated", {
                    description: values.name,
                });
            } else {
                await create.mutateAsync(values);

                toast.success("Project created", {
                    description: values.name,
                });
            }

            onOpenChange(false);
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: project
                    ? "We couldn't save those changes"
                    : "We couldn't create that project",
                description: "Check the details and try again.",
            });

            toast.error(title, { description });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit project" : "Create project"}
                    </DialogTitle>

                    <DialogDescription>
                        {isEdit
                            ? "Changes apply to this project across its boards and work items."
                            : "A project groups boards and work items under one name and short key."}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex min-h-0 flex-1 flex-col gap-0"
                >
                    <DialogBody className="-mx-4 px-4 sm:mx-0 sm:px-0">
                        <div className="space-y-5">
                            <FormField
                                label="Project name"
                                htmlFor="project-name"
                                required
                                error={errors.name?.message}
                            >
                                {(aria) => (
                                    <Input
                                        {...aria}
                                        placeholder="Customer Portal"
                                        autoComplete="off"
                                        disabled={pending}
                                        {...register("name")}
                                    />
                                )}
                            </FormField>

                            <FormField
                                label="Project key"
                                htmlFor="project-key"
                                required
                                hint={
                                    isEdit
                                        ? "Work items are numbered against the key — e.g. CP-14 — so it stays fixed once the project exists."
                                        : "2–8 uppercase letters. Work items are numbered against it, e.g. CP-14."
                                }
                                error={errors.key?.message}
                            >
                                {(aria) => (
                                    <Input
                                        {...aria}
                                        placeholder="CP"
                                        autoCapitalize="characters"
                                        spellCheck={false}
                                        className="font-mono uppercase"
                                        disabled={pending}
                                        readOnly={isEdit}
                                        aria-readonly={isEdit}
                                        {...register("key")}
                                    />
                                )}
                            </FormField>

                            {!isEdit &&
                                !watchedKey &&
                                watchedName.trim().length > 1 && (
                                    <button
                                        type="button"
                                        onClick={suggestKey}
                                        className="
                                        -mt-2 inline-flex items-center gap-1.5 text-xs font-medium
                                        text-primary underline-offset-2 hover:underline
                                    "
                                    >
                                        Use “
                                        {watchedName
                                            .toUpperCase()
                                            .replace(/[^A-Z]/g, "")
                                            .slice(0, 8)}
                                        ” as the key
                                    </button>
                                )}

                            <FormField
                                label="Description"
                                htmlFor="project-description"
                                optional
                                error={errors.description?.message}
                            >
                                {(aria) => (
                                    <Textarea
                                        {...aria}
                                        rows={3}
                                        placeholder="What this project covers…"
                                        disabled={pending}
                                        {...register("description")}
                                    />
                                )}
                            </FormField>

                            {/* ---------------- COLOR ---------------- */}
                            <fieldset className="space-y-2">
                                <legend className="text-[13px] leading-none font-medium text-foreground">
                                    Color
                                </legend>

                                <div className="flex flex-wrap gap-2.5">
                                    {PROJECT_COLORS.map((color) => {
                                        const active = selectedColor === color;

                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() =>
                                                    setValue("color", color, {
                                                        shouldValidate: true,
                                                    })
                                                }
                                                aria-label={`Use color ${color}`}
                                                aria-pressed={active}
                                                className={cn(
                                                    "size-8 rounded-full transition-transform duration-(--transition-fast)",
                                                    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                                                    active
                                                        ? "scale-100 ring-2 ring-offset-2 ring-offset-card"
                                                        : "scale-95 opacity-70 hover:scale-100 hover:opacity-100"
                                                )}
                                                style={{
                                                    backgroundColor: color,
                                                    ...(active
                                                        ? {
                                                              "--tw-ring-color":
                                                                  color,
                                                          }
                                                        : {}),
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </fieldset>

                            {/* ---------------- ICON ---------------- */}
                            <fieldset className="space-y-2">
                                <legend className="text-[13px] leading-none font-medium text-foreground">
                                    Icon
                                </legend>

                                <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
                                    {PROJECT_ICONS.map((icon) => {
                                        const active = selectedIcon === icon;

                                        return (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() =>
                                                    setValue("icon", icon, {
                                                        shouldValidate: true,
                                                    })
                                                }
                                                aria-label={`Use icon ${icon}`}
                                                aria-pressed={active}
                                                className={cn(
                                                    "flex aspect-square items-center justify-center rounded-lg border text-lg",
                                                    "transition-colors duration-(--transition-fast) outline-none",
                                                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                                                    active
                                                        ? "border-primary bg-primary-subtle"
                                                        : "border-border bg-card hover:border-border-strong hover:bg-surface-muted"
                                                )}
                                            >
                                                <span aria-hidden="true">
                                                    {icon}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </fieldset>

                            {/* Live preview keeps the two pickers from feeling abstract */}
                            <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-surface-muted/50 p-3">
                                <ProjectMark
                                    color={selectedColor}
                                    icon={selectedIcon}
                                    keyName={watchedKey || "KEY"}
                                    size="md"
                                />

                                <div className="min-w-0">
                                    <p className="truncate text-[13px] font-semibold text-foreground">
                                        {watchedName.trim() || "Project name"}
                                    </p>

                                    <p className="text-[11px] tracking-[0.05em] text-muted-foreground uppercase">
                                        {watchedKey.trim() || "KEY"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </DialogBody>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={pending}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" disabled={pending}>
                            {pending && <Loader2 className="animate-spin" />}
                            {pending
                                ? isEdit
                                    ? "Saving…"
                                    : "Creating…"
                                : isEdit
                                  ? "Save changes"
                                  : "Create project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
