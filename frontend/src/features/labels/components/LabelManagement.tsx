import { useMemo, useState } from "react";
import {
    ArrowDownWideNarrow,
    Pencil,
    Plus,
    Search,
    Tags,
    Trash2,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyStateCard } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirm } from "@/components/common/confirm";
import { normalizeError } from "@/lib/errors";
import { toast } from "@/lib/toast";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { isMemberRole } from "@/lib/auth-roles";

import LabelFormDialog from "./LabelFormDialog";
import { LabelSwatch, LabelSwatchTile } from "./LabelSwatch";

import { useLabels } from "../hooks/useLabels";
import { useCreateLabel } from "../hooks/useCreateLabel";
import { useUpdateLabel } from "../hooks/useUpdateLabel";
import { useDeleteLabel } from "../hooks/useDeleteLabel";

import type { CreateLabelRequest, Label } from "../types/label";

type SortMode = "name-asc" | "name-desc" | "newest";

const SORT_LABELS: Record<SortMode, string> = {
    "name-asc": "Name, A–Z",
    "name-desc": "Name, Z–A",
    newest: "Newest first",
};

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
    const currentUserRole = useAuthStore((state) => state.user?.role);
    const canEdit = isMemberRole(currentUserRole);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingLabel, setEditingLabel] = useState<Label | null>(null);

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortMode>("name-asc");

    const openCreateDialog = () => {
        if (!canEdit) return;

        setEditingLabel(null);
        setDialogOpen(true);
    };

    const openEditDialog = (label: Label) => {
        if (!canEdit) return;

        setEditingLabel(label);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        if (createMutation.isPending || updateMutation.isPending) return;

        setDialogOpen(false);
        setEditingLabel(null);
    };

    const handleSubmit = (data: CreateLabelRequest) => {
        if (!canEdit) return;

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
        if (!canEdit) return;

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

    const visibleLabels = useMemo(() => {
        const query = search.trim().toLowerCase();

        return labels
            .filter((label) => {
                if (!query) return true;

                return (
                    label.name.toLowerCase().includes(query) ||
                    (label.description ?? "").toLowerCase().includes(query)
                );
            })
            .sort((left, right) => {
                if (sort === "name-desc") {
                    return right.name.localeCompare(left.name, undefined, {
                        sensitivity: "base",
                    });
                }

                if (sort === "newest") {
                    return (
                        new Date(right.createdAt).getTime() -
                        new Date(left.createdAt).getTime()
                    );
                }

                return left.name.localeCompare(right.name, undefined, {
                    sensitivity: "base",
                });
            });
    }, [labels, search, sort]);

    const createButton = (
        <Button size="sm" onClick={openCreateDialog}>
            <Plus />
            New label
        </Button>
    );

    const isFiltering = search.trim().length > 0;

    return (
        <div className="space-y-5">
            {/* ---------------- Header ---------------- */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <div className="min-w-0">
                    <h2 className="font-heading text-lg font-semibold tracking-[-0.01em] text-foreground">
                        Labels
                    </h2>
                    <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                        {formatNumber(labels.length)}{" "}
                        {labels.length === 1 ? "label" : "labels"}
                        {isFiltering ? (
                            <>
                                {"  ·  "}
                                showing {formatNumber(visibleLabels.length)}
                            </>
                        ) : null}
                    </p>
                </div>

                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    <div className="relative w-full min-w-0 sm:w-auto sm:flex-none">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search labels"
                            aria-label="Search labels"
                            className="h-9 w-full rounded-lg pr-8 pl-9 sm:w-64"
                        />
                        {search ? (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                                className="absolute top-1/2 right-2 grid size-5 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <X className="size-3.5" />
                            </button>
                        ) : null}
                    </div>

                    <label className="relative inline-flex items-center">
                        <span className="sr-only">Sort labels</span>
                        <ArrowDownWideNarrow
                            aria-hidden="true"
                            className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground"
                        />
                        <select
                            value={sort}
                            onChange={(event) =>
                                setSort(event.target.value as SortMode)
                            }
                            className={cn(
                                "h-9 cursor-pointer appearance-none rounded-lg border border-input bg-card pr-8 pl-8 text-[13px] font-medium text-foreground",
                                "outline-none transition-colors hover:border-border-strong",
                                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35"
                            )}
                        >
                            {(Object.keys(SORT_LABELS) as SortMode[]).map(
                                (mode) => (
                                    <option key={mode} value={mode}>
                                        {SORT_LABELS[mode]}
                                    </option>
                                )
                            )}
                        </select>
                    </label>

                    {canEdit && createButton}
                </div>
            </div>

            {/* ---------------- Body ---------------- */}
            {isLoading ? (
                <LabelGridSkeleton />
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
                <EmptyStateCard
                    icon={Tags}
                    tone="brand"
                    title="No labels yet"
                    description="Create your first label to group, filter, and report on related work items."
                    action={
                        canEdit ? (
                            <Button onClick={openCreateDialog}>
                                <Plus />
                                Create label
                            </Button>
                        ) : undefined
                    }
                />
            ) : visibleLabels.length === 0 ? (
                <EmptyStateCard
                    icon={Search}
                    title="No matching labels"
                    description={`Nothing matches “${search.trim()}”. Try a different search.`}
                    action={
                        <Button
                            variant="outline"
                            onClick={() => setSearch("")}
                        >
                            Clear search
                        </Button>
                    }
                />
            ) : (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {visibleLabels.map((label) => (
                        <LabelCard
                            key={label.id}
                            label={label}
                            onEdit={() => openEditDialog(label)}
                            onDelete={() => void handleDelete(label)}
                            canEdit={canEdit}
                            actionsDisabled={
                                !canEdit ||
                                updateMutation.isPending ||
                                deleteMutation.isPending
                            }
                            deleting={deleteMutation.isPending}
                        />
                    ))}
                </ul>
            )}

            <LabelFormDialog
                open={dialogOpen && canEdit}
                label={editingLabel}
                isSubmitting={
                    createMutation.isPending || updateMutation.isPending
                }
                onClose={closeDialog}
                onSubmit={handleSubmit}
            />
        </div>
    );
}

/* =========================================================
   LABEL CARD
   The color tile is the hero; the name and description support it.
   Actions are always present but quiet, and surface on hover/focus.
   ========================================================= */

function LabelCard({
    label,
    onEdit,
    onDelete,
    actionsDisabled,
    deleting,
    canEdit,
}: {
    label: Label;
    onEdit: () => void;
    onDelete: () => void;
    actionsDisabled: boolean;
    deleting: boolean;
    canEdit: boolean;
}) {
    return (
        <li
            className={cn(
                "group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs",
                "transition-all duration-(--transition-fast)",
                "hover:border-border-strong hover:shadow-sm",
                "focus-within:border-border-strong"
            )}
        >
            <div className="flex items-start gap-3">
                <LabelSwatchTile color={label.color} />

                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                        <h3 className="min-w-0 truncate text-sm font-semibold text-foreground">
                            {label.name}
                        </h3>

                        {/* Actions: always in the tab order, visually quiet
                            until the card is hovered or holds focus. */}
                        {canEdit && <div
                            className={cn(
                                "ml-auto flex shrink-0 items-center gap-0.5 transition-opacity",
                                "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                            )}
                        >
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={onEdit}
                                disabled={actionsDisabled}
                                aria-label={`Edit ${label.name}`}
                                title="Edit label"
                            >
                                <Pencil />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={onDelete}
                                disabled={actionsDisabled}
                                aria-label={`Delete ${label.name}`}
                                title="Delete label"
                                className="text-muted-foreground hover:bg-danger-subtle hover:text-danger-foreground"
                            >
                                {deleting ? (
                                    <span
                                        aria-hidden="true"
                                        className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                                    />
                                ) : (
                                    <Trash2 />
                                )}
                            </Button>
                        </div>}
                    </div>

                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {label.description?.trim() || "No description"}
                    </p>
                </div>
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                <LabelSwatch
                    name={label.name}
                    color={label.color}
                    size="sm"
                    dot
                    className="max-w-[70%]"
                />

                <code className="shrink-0 rounded-md bg-surface-muted px-1.5 py-0.5 font-mono text-[10.5px] uppercase text-muted-foreground">
                    {label.color}
                </code>
            </div>
        </li>
    );
}

/* =========================================================
   SKELETON
   Mirrors the card grid geometry so the layout doesn't jump.
   ========================================================= */

function LabelGridSkeleton() {
    return (
        <ul
            aria-hidden="true"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
            {Array.from({ length: 6 }).map((_, index) => (
                <li
                    key={index}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs"
                >
                    <div className="flex items-start gap-3">
                        <Skeleton className="size-11 rounded-xl" />
                        <div className="min-w-0 flex-1 space-y-2">
                            <Skeleton className="h-3.5 w-2/3" />
                            <Skeleton className="h-3 w-full opacity-70" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                        <Skeleton className="h-4 w-20 rounded-full" />
                        <Skeleton className="h-4 w-12 rounded-md" />
                    </div>
                </li>
            ))}
        </ul>
    );
}