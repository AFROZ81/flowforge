import {
    useMemo,
    useState,
} from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
    Tag,
    Check,
    Loader2,
} from "lucide-react";

import { useLabels } from "../hooks/useLabels";
import {
    useWorkItemLabels,
} from "../hooks/useWorkItemLabels";
import {
    useAssignLabel,
} from "../hooks/useAssignLabel";
import {
    useRemoveLabel,
} from "../hooks/useRemoveLabel";

type Props = {
    open: boolean;
    onOpenChange: (
        open: boolean
    ) => void;
    workItemId: string;
    workItemTitle: string;
};

export default function LabelsDialog({
    open,
    onOpenChange,
    workItemId,
    workItemTitle,
}: Props) {
    const {
        data: labels = [],
        isLoading: labelsLoading,
    } = useLabels();

    const {
        data: workItemLabels = [],
        isLoading:
            workItemLabelsLoading,
    } = useWorkItemLabels(
        workItemId
    );

    const assignMutation =
        useAssignLabel();

    const removeMutation =
        useRemoveLabel();

    const [
        processingLabelId,
        setProcessingLabelId,
    ] = useState<string | null>(
        null
    );

    const assignedLabelIds =
        useMemo(
            () =>
                new Set(
                    workItemLabels.map(
                        (label) =>
                            label.labelId
                    )
                ),
            [workItemLabels]
        );

    const handleLabelClick = async (
        labelId: string
    ) => {
        if (
            assignMutation.isPending ||
            removeMutation.isPending
        ) {
            return;
        }

        try {
            setProcessingLabelId(
                labelId
            );

            if (
                assignedLabelIds.has(
                    labelId
                )
            ) {
                await removeMutation.mutateAsync(
                    {
                        workItemId,
                        labelId,
                    }
                );
            } else {
                await assignMutation.mutateAsync(
                    {
                        workItemId,
                        labelId,
                    }
                );
            }
        } finally {
            setProcessingLabelId(
                null
            );
        }
    };

    const isLoading =
        labelsLoading ||
        workItemLabelsLoading;

    return (
        <Dialog
            open={open}
            onOpenChange={
                onOpenChange
            }
        >
            <DialogContent
                className="
                    max-h-[80vh]
                    overflow-y-auto
                    sm:max-w-md
                "
            >
                <DialogHeader>
                    <DialogTitle>
                        Labels
                    </DialogTitle>

                    <DialogDescription>
                        Manage labels for "
                        {workItemTitle}"
                    </DialogDescription>
                </DialogHeader>

                <div className="
                    mt-2
                ">
                    <div className="
                        mb-3
                        flex
                        items-center
                        justify-between
                    ">
                        <div className="
                            flex
                            items-center
                            gap-2
                        ">
                            <Tag className="
                                h-4
                                w-4
                                text-muted-foreground
                            " />

                            <span className="
                                text-sm
                                font-medium
                            ">
                                Labels
                            </span>

                            <span className="
                                rounded-full
                                bg-muted
                                px-1.5
                                py-0.5
                                text-[10px]
                                font-medium
                            ">
                                {
                                    workItemLabels.length
                                }
                            </span>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="
                            flex
                            min-h-24
                            items-center
                            justify-center
                            rounded-lg
                            border
                        ">
                            <Loader2 className="
                                h-5
                                w-5
                                animate-spin
                                text-muted-foreground
                            " />
                        </div>
                    ) : labels.length === 0 ? (
                        <div className="
                            rounded-lg
                            border
                            border-dashed
                            p-8
                            text-center
                            text-sm
                            text-muted-foreground
                        ">
                            No labels available.
                        </div>
                    ) : (
                        <div className="
                            space-y-2
                        ">
                            {labels.map(
                                (label) => {
                                    const isAssigned =
                                        assignedLabelIds.has(
                                            label.id
                                        );

                                    const isProcessing =
                                        processingLabelId ===
                                        label.id;

                                    return (
                                        <Button
                                            key={
                                                label.id
                                            }
                                            type="button"
                                            variant="ghost"
                                            disabled={
                                                isProcessing ||
                                                assignMutation.isPending ||
                                                removeMutation.isPending
                                            }
                                            onClick={() =>
                                                handleLabelClick(
                                                    label.id
                                                )
                                            }
                                            className="
                                                flex
                                                h-auto
                                                w-full
                                                items-center
                                                justify-between
                                                rounded-lg
                                                border
                                                px-3
                                                py-2.5
                                                text-left
                                                hover:bg-muted/50
                                            "
                                        >
                                            <div className="
                                                flex
                                                min-w-0
                                                items-center
                                                gap-2.5
                                            ">
                                                <span
                                                    className="
                                                        h-3
                                                        w-3
                                                        shrink-0
                                                        rounded-full
                                                    "
                                                    style={{
                                                        backgroundColor:
                                                            label.color ||
                                                            "#6b7280",
                                                    }}
                                                />

                                                <div className="
                                                    min-w-0
                                                ">
                                                    <p className="
                                                        truncate
                                                        text-sm
                                                        font-medium
                                                    ">
                                                        {
                                                            label.name
                                                        }
                                                    </p>

                                                    {label.description && (
                                                        <p className="
                                                            truncate
                                                            text-xs
                                                            text-muted-foreground
                                                        ">
                                                            {
                                                                label.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {isProcessing ? (
                                                <Loader2 className="
                                                    h-4
                                                    w-4
                                                    shrink-0
                                                    animate-spin
                                                " />
                                            ) : isAssigned ? (
                                                <span className="
                                                    flex
                                                    h-6
                                                    w-6
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    bg-foreground
                                                    text-background
                                                ">
                                                    <Check className="
                                                        h-3.5
                                                        w-3.5
                                                    " />
                                                </span>
                                            ) : (
                                                <span className="
                                                    h-6
                                                    w-6
                                                    shrink-0
                                                    rounded-full
                                                    border
                                                " />
                                            )}
                                        </Button>
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}