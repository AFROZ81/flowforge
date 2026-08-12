import {
    useState,
} from "react";

import LabelFormDialog from "./LabelFormDialog";

import {
    useLabels,
} from "../hooks/useLabels";

import {
    useCreateLabel,
} from "../hooks/useCreateLabel";

import {
    useUpdateLabel,
} from "../hooks/useUpdateLabel";

import {
    useDeleteLabel,
} from "../hooks/useDeleteLabel";

import type {
    CreateLabelRequest,
    Label,
} from "../types/label";

export default function LabelManagement() {
    const {
        data: labels = [],
        isLoading,
        isError,
        refetch,
    } = useLabels();

    const createMutation =
        useCreateLabel();

    const updateMutation =
        useUpdateLabel();

    const deleteMutation =
        useDeleteLabel();

    const [dialogOpen, setDialogOpen] =
        useState(false);

    const [editingLabel, setEditingLabel] =
        useState<Label | null>(null);

    const openCreateDialog = () => {
        setEditingLabel(null);
        setDialogOpen(true);
    };

    const openEditDialog = (
        label: Label
    ) => {
        setEditingLabel(label);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        if (
            createMutation.isPending ||
            updateMutation.isPending
        ) {
            return;
        }

        setDialogOpen(false);
        setEditingLabel(null);
    };

    const handleSubmit = (
        data: CreateLabelRequest
    ) => {
        if (editingLabel) {
            updateMutation.mutate(
                {
                    id: editingLabel.id,
                    data: {
                        labelId:
                            editingLabel.id,
                        ...data,
                    },
                },
                {
                    onSuccess: () => {
                        closeDialog();
                    },
                }
            );

            return;
        }

        createMutation.mutate(
            data,
            {
                onSuccess: () => {
                    closeDialog();
                },
            }
        );
    };

    const handleDelete = (
        label: Label
    ) => {
        const confirmed =
            window.confirm(
                `Are you sure you want to delete the "${label.name}" label?`
            );

        if (!confirmed) {
            return;
        }

        deleteMutation.mutate(
            label.id
        );
    };

    return (
        <>
            <section className="rounded-xl border border-gray-200 bg-white p-6">

                {/* Page Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Labels
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage labels used across your workspace.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={
                            openCreateDialog
                        }
                        className="shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
                    >
                        + Create Label
                    </button>
                </div>

                {/* Content */}
                <div className="mt-6">

                    {/* Loading */}
                    {isLoading && (
                        <div className="space-y-2">
                            {[
                                1, 2, 3,
                            ].map(
                                (item) => (
                                    <div
                                        key={
                                            item
                                        }
                                        className="h-[72px] animate-pulse rounded-lg border border-gray-100 bg-gray-50"
                                    />
                                )
                            )}
                        </div>
                    )}

                    {/* Error */}
                    {!isLoading &&
                        isError && (
                            <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-center">
                                <p className="text-sm font-medium text-red-700">
                                    Failed to load labels.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        refetch()
                                    }
                                    className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                    {/* Empty */}
                    {!isLoading &&
                        !isError &&
                        labels.length ===
                            0 && (
                            <div className="rounded-lg border border-dashed border-gray-300 px-6 py-12 text-center">
                                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
                                    🏷
                                </div>

                                <h3 className="mt-3 text-sm font-semibold text-gray-900">
                                    No labels yet
                                </h3>

                                <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500">
                                    Create your first label to organize work items across your workspace.
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        openCreateDialog
                                    }
                                    className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
                                >
                                    + Create Label
                                </button>
                            </div>
                        )}

                    {/* Labels */}
                    {!isLoading &&
                        !isError &&
                        labels.length >
                            0 && (
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                {labels.map(
                                    (
                                        label,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                label.id
                                            }
                                            className={`flex items-center justify-between gap-4 px-4 py-4 ${
                                                index <
                                                labels.length -
                                                    1
                                                    ? "border-b border-gray-100"
                                                    : ""
                                            }`}
                                        >
                                            {/* Label Info */}
                                            <div className="flex min-w-0 items-center gap-3">

                                                <span
                                                    className="h-3 w-3 shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            label.color,
                                                    }}
                                                />

                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="truncate text-sm font-medium text-gray-900"
                                                        >
                                                            {
                                                                label.name
                                                            }
                                                        </span>

                                                        <span
                                                            className="hidden rounded-full border px-2 py-0.5 text-[10px] font-medium sm:inline-flex"
                                                            style={{
                                                                color:
                                                                    label.color,
                                                                borderColor:
                                                                    `${label.color}55`,
                                                                backgroundColor:
                                                                    `${label.color}10`,
                                                            }}
                                                        >
                                                            {
                                                                label.name
                                                            }
                                                        </span>
                                                    </div>

                                                    {label.description && (
                                                        <p className="mt-1 truncate text-xs text-gray-500">
                                                            {
                                                                label.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex shrink-0 items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditDialog(
                                                            label
                                                        )
                                                    }
                                                    disabled={
                                                        updateMutation.isPending ||
                                                        deleteMutation.isPending
                                                    }
                                                    className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            label
                                                        )
                                                    }
                                                    disabled={
                                                        deleteMutation.isPending
                                                    }
                                                    className="rounded-md px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                </div>
            </section>

            <LabelFormDialog
                open={dialogOpen}
                label={
                    editingLabel
                }
                isSubmitting={
                    createMutation.isPending ||
                    updateMutation.isPending
                }
                onClose={
                    closeDialog
                }
                onSubmit={
                    handleSubmit
                }
            />
        </>
    );
}