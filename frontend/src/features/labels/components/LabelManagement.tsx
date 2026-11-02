import { useState } from "react";
import { Tags, Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirm } from "@/components/common/confirm";
import { normalizeError } from "@/lib/errors";
import { toast } from "sonner";

import LabelFormDialog from "./LabelFormDialog";
import { LabelSwatch } from "./LabelSwatch";

import { useLabels } from "../hooks/useLabels";
import { useCreateLabel } from "../hooks/useCreateLabel";
import { useUpdateLabel } from "../hooks/useUpdateLabel";
import { useDeleteLabel } from "../hooks/useDeleteLabel";

import type { CreateLabelRequest, Label } from "../types/label";

export default function LabelManagement() {
    const {
        data: labels = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useLabels();

    const createMutation = useCreateLabel();
    const updateMutation = useUpdateLabel();
    const deleteMutation = useDeleteLabel();
    const confirm = useConfirm();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingLabel, setEditingLabel] = useState<Label | null>(null);

    const openCreateDialog = () => {
        setEditingLabel(null);
        setDialogOpen(true);
    };

    const openEditDialog = (label: Label) => {
        setEditingLabel(label);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        if (createMutation.isPending || updateMutation.isPending) return;

        setDialogOpen(false);
        setEditingLabel(null);
    };

    const handleSubmit = (data: CreateLabelRequest) => {
        if (editingLabel) {
            updateMutation.mutate(
                {
                    id: editingLabel.id,
                    data: { labelId: editingLabel.id, ...data },
                },
                { onSuccess: () => closeDialog() }
            );

            return;
        }

        createMutation.mutate(data, {
            onSuccess: () => closeDialog(),
        });
    };

    async function handleDelete(label: Label) {
        const ok = await confirm({
            title: `Delete the “${label.name}” label?`,
            description:
                "It disappears from every work item using it. This can't be undone.",
            confirmLabel: "Delete label",
            tone: "destructive",
        });

        if (!ok) return;

        deleteMutation.mutate(label.id, {
            onError: (err) => {
                const { title, description } = normalizeError(err, {
                    title: "We couldn't delete that label",
                });

                toast.error(title, { description });
            },
        });
    }

    const createButton = (
        <Button size="sm" onClick={openCreateDialog}>
            <Plus />
            New label
        </Button>
    );

    return (
        <>
            <section
                aria-label="Labels"
                className="rounded-xl border border-border bg-card p-5 shadow-xs"
            >
                <SectionHeader
                    title="Labels"
                    description="Tag work items so they can be filtered and reported on together."
                    action={createButton}
                />

                <div className="mt-5">
                    {isLoading ? (
                        <ul className="space-y-2">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <li key={index}>
                                    <Skeleton className="h-14 rounded-lg" />
                                </li>
                            ))}
                        </ul>
                    ) : isError ? (
                        <ErrorState
                            error={error}
                            title="We couldn't load your labels"
                            action={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => void refetch()}
                                >
                                    Try again
                                </Button>
                            }
                        />
                    ) : labels.length === 0 ? (
                        <EmptyState
                            icon={Tags}
                            title="No labels yet"
                            description="Create your first label to organize work items across the workspace."
                            action={
                                <Button onClick={openCreateDialog}>
                                    <Plus />
                                    Create label
                                </Button>
                            }
                            size="sm"
                            className="rounded-lg border border-dashed border-border-strong py-10"
                        />
                    ) : (
                        <ul className="overflow-hidden rounded-lg border border-border">
                            {labels.map((label, index) => (
                                <li
                                    key={label.id}
                                    className={
                                        index < labels.length - 1
                                            ? "border-b border-border-subtle"
                                            : undefined
                                    }
                                >
                                    {/* Stack on a phone: the name and its actions
                                        rarely share a line at 360px. */}
                                    <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span
                                                aria-hidden="true"
                                                className="size-3 shrink-0 rounded-full ring-2 ring-border-subtle"
                                                style={{
                                                    backgroundColor:
                                                        label.color,
                                                }}
                                            />

                                            <div className="min-w-0">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <span className="truncate text-sm font-medium text-foreground">
                                                        {label.name}
                                                    </span>

                                                    {/* Hidden on phones; the
                                                        colored dot already says it */}
                                                    <LabelSwatch
                                                        name={label.name}
                                                        color={label.color}
                                                        size="sm"
                                                        className="hidden sm:inline-flex"
                                                    />
                                                </div>

                                                {label.description && (
                                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                        {label.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-auto">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    openEditDialog(label)
                                                }
                                                disabled={
                                                    updateMutation.isPending ||
                                                    deleteMutation.isPending
                                                }
                                            >
                                                <Pencil />
                                                <span className="hidden sm:inline">
                                                    Edit
                                                </span>
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    void handleDelete(label)
                                                }
                                                disabled={
                                                    deleteMutation.isPending
                                                }
                                                className="text-danger-foreground hover:bg-danger-subtle hover:text-danger-foreground"
                                            >
                                                <Trash2 />
                                                <span className="hidden sm:inline">
                                                    Delete
                                                </span>
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <LabelFormDialog
                open={dialogOpen}
                label={editingLabel}
                isSubmitting={
                    createMutation.isPending || updateMutation.isPending
                }
                onClose={closeDialog}
                onSubmit={handleSubmit}
            />
        </>
    );
}
