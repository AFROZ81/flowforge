import {
    useEffect,
    useState,
} from "react";

import type {
    CreateLabelRequest,
    Label,
} from "../types/label";

interface Props {
    open: boolean;
    label?: Label | null;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (
        data: CreateLabelRequest
    ) => void;
}

const DEFAULT_COLOR = "#3B82F6";

export default function LabelFormDialog({
    open,
    label,
    isSubmitting,
    onClose,
    onSubmit,
}: Props) {
    const isEdit = Boolean(label);

    const [name, setName] = useState("");
    const [color, setColor] =
        useState(DEFAULT_COLOR);
    const [description, setDescription] =
        useState("");

    useEffect(() => {
        if (!open) {
            return;
        }

        setName(label?.name ?? "");
        setColor(
            label?.color || DEFAULT_COLOR
        );
        setDescription(
            label?.description ?? ""
        );
    }, [open, label]);

    if (!open) {
        return null;
    }

    const handleSubmit = (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        const trimmedName =
            name.trim();

        if (!trimmedName) {
            return;
        }

        onSubmit({
            name: trimmedName,
            color,
            description:
                description.trim(),
        });
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div
                className="w-full max-w-[460px] rounded-xl border border-gray-200 bg-white shadow-xl"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            {isEdit
                                ? "Edit Label"
                                : "Create Label"}
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            {isEdit
                                ? "Update the label details."
                                : "Create a label for your workspace."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={
                            isSubmitting
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-md text-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 px-5 py-5"
                >
                    {/* Name */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700">
                            Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value
                                )
                            }
                            placeholder="e.g. Bug"
                            maxLength={100}
                            autoFocus
                            disabled={
                                isSubmitting
                            }
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                        />
                    </div>

                    {/* Color */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700">
                            Color
                        </label>

                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={color}
                                onChange={(
                                    event
                                ) =>
                                    setColor(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                disabled={
                                    isSubmitting
                                }
                                className="h-10 w-12 cursor-pointer rounded-md border border-gray-200 bg-white p-1"
                            />

                            <input
                                type="text"
                                value={color}
                                onChange={(
                                    event
                                ) =>
                                    setColor(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                maxLength={7}
                                disabled={
                                    isSubmitting
                                }
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700">
                            Description
                        </label>

                        <textarea
                            value={
                                description
                            }
                            onChange={(event) =>
                                setDescription(
                                    event.target.value
                                )
                            }
                            placeholder="Describe what this label is used for..."
                            rows={3}
                            maxLength={500}
                            disabled={
                                isSubmitting
                            }
                            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                        />
                    </div>

                    {/* Preview */}
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                            Preview
                        </p>

                        <span
                            className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium"
                            style={{
                                color,
                                borderColor:
                                    `${color}55`,
                                backgroundColor:
                                    `${color}12`,
                            }}
                        >
                            <span
                                className="mr-1.5 h-1.5 w-1.5 rounded-full"
                                style={{
                                    backgroundColor:
                                        color,
                                }}
                            />

                            {name.trim() ||
                                "Label"}
                        </span>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={
                                isSubmitting
                            }
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                !name.trim()
                            }
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting
                                ? isEdit
                                    ? "Saving..."
                                    : "Creating..."
                                : isEdit
                                  ? "Save Changes"
                                  : "Create Label"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}