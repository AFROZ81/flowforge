import { useMemo, useState } from "react";
import { Check, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";

import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { LabelSwatch } from "./LabelSwatch";
import { normalizeError } from "@/lib/errors";
import { cn } from "@/lib/utils";

import { useLabels } from "../hooks/useLabels";
import { useWorkItemLabels } from "../hooks/useWorkItemLabels";
import { useAssignLabel } from "../hooks/useAssignLabel";
import { useRemoveLabel } from "../hooks/useRemoveLabel";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workItemId: string;
    workItemTitle: string;
};

export default function LabelsDialog({
    open,
    onOpenChange,
    workItemId,
    workItemTitle,
}: Props) {
    const { data: labels = [], isLoading: labelsLoading } = useLabels();

    const {
        data: workItemLabels = [],
        isLoading: workItemLabelsLoading,
    } = useWorkItemLabels(workItemId);

    const assignMutation = useAssignLabel();
    const removeMutation = useRemoveLabel();

    const [processingLabelId, setProcessingLabelId] = useState<
        string | null
    >(null);

    const assignedLabelIds = useMemo(
        () =>
            new Set(
                workItemLabels.map((label) => label.labelId)
            ),
        [workItemLabels]
    );

    const isLoading = labelsLoading || workItemLabelsLoading;
    const busy =
        assignMutation.isPending || removeMutation.isPending;

    async function handleLabelClick(labelId: string) {
        if (busy) return;

        try {
            setProcessingLabelId(labelId);

            if (assignedLabelIds.has(labelId)) {
                await removeMutation.mutateAsync({ workItemId, labelId });
            } else {
                await assignMutation.mutateAsync({ workItemId, labelId });
            }
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: "We couldn't change that label",
                description: "Nothing was saved — try again.",
            });

            toast.error(title, { description });
        } finally {
            setProcessingLabelId(null);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[88dvh] flex-col sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Labels</DialogTitle>

                    <DialogDescription>
                        Tag{" "}
                        <span className="font-medium text-foreground">
                            {workItemTitle}
                        </span>{" "}
                        so it groups with related work.
                    </DialogDescription>
                </DialogHeader>

                <DialogBody className="-mx-4 px-4 sm:mx-0 sm:px-0">
                    {isLoading ? (
                        <div className="space-y-2" aria-hidden="true">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-12 rounded-lg" />
                            ))}
                        </div>
                    ) : labels.length === 0 ? (
                        <EmptyState
                            icon={Tag}
                            title="No labels exist yet"
                            description="Create labels under Settings → Labels, then assign them here."
                            size="sm"
                            className="rounded-lg border border-dashed border-border-strong py-8"
                        />
                    ) : (
                        <ul className="space-y-1.5">
                            {labels.map((label) => {
                                const isAssigned =
                                    assignedLabelIds.has(label.id);
                                const isProcessing =
                                    processingLabelId === label.id;

                                return (
                                    <li key={label.id}>
                                        <button
                                            type="button"
                                            aria-pressed={isAssigned}
                                            disabled={isProcessing || busy}
                                            onClick={() =>
                                                void handleLabelClick(label.id)
                                            }
                                            className={cn(
                                                "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left",
                                                "transition-colors duration-(--transition-fast)",
                                                "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                                                "disabled:cursor-not-allowed disabled:opacity-60",
                                                isAssigned
                                                    ? "border-primary/25 bg-primary-subtle/60"
                                                    : "border-border bg-card hover:bg-surface-muted"
                                            )}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={cn(
                                                    "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                                                    isAssigned
                                                        ? "border-primary bg-primary text-primary-foreground"
                                                        : "border-border-strong bg-card"
                                                )}
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="size-3 animate-spin" />
                                                ) : (
                                                    isAssigned && (
                                                        <Check className="size-3" strokeWidth={3} />
                                                    )
                                                )}
                                            </span>

                                            <span
                                                aria-hidden="true"
                                                className="size-2.5 shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        label.color || undefined,
                                                }}
                                            />

                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium text-foreground">
                                                    {label.name}
                                                </span>

                                                {label.description && (
                                                    <span className="block truncate text-xs text-muted-foreground">
                                                        {label.description}
                                                    </span>
                                                )}
                                            </span>

                                            {isAssigned && (
                                                <LabelSwatch
                                                    name="Assigned"
                                                    color={label.color}
                                                    size="sm"
                                                    className="hidden sm:inline-flex"
                                                />
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </DialogBody>

                <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="w-full sm:w-auto sm:self-end"
                >
                    Done
                </Button>
            </DialogContent>
        </Dialog>
    );
}
