import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LabelSwatch } from "./LabelSwatch";

import type {
    CreateLabelRequest,
    Label,
} from "../types/label";

interface Props {
    open: boolean;
    label?: Label | null;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (data: CreateLabelRequest) => void;
}

const DEFAULT_COLOR = "#3B82F6";

/* =========================================================
   FORM
   Mounted only while the dialog is open, so a fresh visit
   always starts from the label being edited — the previous
   version carried a useEffect that re-seeded three pieces of
   state after every open.
   ========================================================= */

function LabelForm({
    label,
    isSubmitting,
    onClose,
    onSubmit,
}: Omit<Props, "open">) {
    const isEdit = Boolean(label);

    const [name, setName] = useState(label?.name ?? "");
    const [color, setColor] = useState(label?.color || DEFAULT_COLOR);
    const [description, setDescription] = useState(
        label?.description ?? ""
    );
    const [touched, setTouched] = useState(false);

    const trimmed = name.trim();
    const nameError = touched && !trimmed ? "A label needs a name." : undefined;

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setTouched(true);

        if (!trimmed) return;

        onSubmit({
            name: trimmed,
            color,
            description: description.trim(),
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* ---------------- NAME ---------------- */}
            <div className="space-y-1.5">
                <label
                    htmlFor="label-name"
                    className="flex items-center gap-1 text-[13px] font-medium text-foreground"
                >
                    Name
                    <span aria-hidden="true" className="text-danger">*</span>
                </label>

                <Input
                    id="label-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Bug"
                    maxLength={100}
                    autoFocus
                    autoComplete="off"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(nameError)}
                />

                {nameError && (
                    <p role="alert" className="text-xs font-medium text-danger-foreground">
                        {nameError}
                    </p>
                )}
            </div>

            {/* ---------------- COLOR ---------------- */}
            <div className="space-y-1.5">
                <label
                    htmlFor="label-color"
                    className="block text-[13px] font-medium text-foreground"
                >
                    Color
                </label>

                <div className="flex items-center gap-2.5">
                    {/* The native picker is the shortest route to an exact color
                        on touch devices, where a custom swatch grid is fiddly. */}
                    <input
                        type="color"
                        value={/^#[0-9a-f]{6}$/i.test(color) ? color : DEFAULT_COLOR}
                        onChange={(event) => setColor(event.target.value)}
                        disabled={isSubmitting}
                        aria-label="Pick a color"
                        className="
                            size-9 shrink-0 cursor-pointer rounded-lg border border-input
                            bg-transparent p-1
                            disabled:cursor-not-allowed disabled:opacity-60
                        "
                    />

                    <Input
                        id="label-color"
                        value={color}
                        onChange={(event) => setColor(event.target.value)}
                        maxLength={7}
                        spellCheck={false}
                        autoComplete="off"
                        className="font-mono uppercase"
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            {/* ---------------- DESCRIPTION ---------------- */}
            <div className="space-y-1.5">
                <label
                    htmlFor="label-description"
                    className="block text-[13px] font-medium text-foreground"
                >
                    Description
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                        (optional)
                    </span>
                </label>

                <Textarea
                    id="label-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="What is this label used for?"
                    rows={3}
                    maxLength={500}
                    disabled={isSubmitting}
                />
            </div>

            {/* ---------------- PREVIEW ---------------- */}
            <div className="rounded-lg border border-border-subtle bg-surface-muted p-3">
                <p className="mb-2 text-[11px] font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                    Preview
                </p>

                <LabelSwatch
                    name={trimmed || "Label"}
                    color={color}
                    dot
                />
            </div>

            <DialogFooter>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="animate-spin" />}
                    {isSubmitting
                        ? isEdit
                            ? "Saving…"
                            : "Creating…"
                        : isEdit
                          ? "Save changes"
                          : "Create label"}
                </Button>
            </DialogFooter>
        </form>
    );
}

/* =========================================================
   DIALOG
   ========================================================= */

export default function LabelFormDialog({ open, ...props }: Props) {
    const isEdit = Boolean(props.label);

    return (
        <Dialog open={open} onOpenChange={(next) => !next && props.onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit label" : "Create label"}
                    </DialogTitle>

                    <DialogDescription>
                        {isEdit
                            ? "Update the label details."
                            : "Labels organize work items across the workspace."}
                    </DialogDescription>
                </DialogHeader>

                {open && <LabelForm {...props} />}
            </DialogContent>
        </Dialog>
    );
}
