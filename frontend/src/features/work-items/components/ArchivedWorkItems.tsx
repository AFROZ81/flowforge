import { useId, useState } from "react";
import { Archive, ArchiveRestore, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeError } from "@/lib/errors";
import { cn } from "@/lib/utils";

import { useArchivedWorkItems } from "../hooks/useArchivedWorkItems";
import { useRestoreWorkItem } from "../hooks/useRestoreWorkItem";

type Props = {
    columnId: string;
};

/**
 * The archived tail of a column.
 *
 * Hidden behind a disclosure so a column full of retired items doesn't
 * dominate the board, and hidden entirely when there's nothing to show.
 */
export default function ArchivedWorkItems({ columnId }: Props) {
    const [open, setOpen] = useState(false);
    const panelId = useId();

    const { data: workItems = [], isLoading } =
        useArchivedWorkItems(columnId);

    const restoreMutation = useRestoreWorkItem();

    const archivedItems = workItems.filter((item) => item.isArchived);

    if (!isLoading && archivedItems.length === 0) {
        return null;
    }

    async function handleRestore(id: string, title: string) {
        try {
            await restoreMutation.mutateAsync(id);

            toast.success("Work item restored", { description: title });
        } catch (error) {
            const { title: heading, description } = normalizeError(error, {
                title: "We couldn't restore that work item",
            });

            toast.error(heading, { description });
        }
    }

    return (
        <div className="shrink-0 border-t border-border-subtle">

            {/* ---------------- disclosure ---------------- */}
            <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((value) => !value)}
                className="
                    flex w-full items-center gap-2 px-3 py-2 text-left
                    text-xs font-medium text-muted-foreground
                    transition-colors hover:bg-surface-muted hover:text-foreground
                    outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring
                "
            >
                <ChevronRight
                    className={cn(
                        "size-3.5 shrink-0 transition-transform duration-(--transition-fast)",
                        open && "rotate-90"
                    )}
                    aria-hidden="true"
                />

                <Archive className="size-3.5 shrink-0" aria-hidden="true" />

                <span>Archived</span>

                <span className="ml-auto rounded-full bg-surface-sunken px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground tabular-nums">
                    {archivedItems.length}
                </span>
            </button>

            {/* ---------------- panel ---------------- */}
            {open && (
                <div
                    id={panelId}
                    className="space-y-1.5 px-3 pb-3"
                    aria-busy={isLoading}
                >
                    {isLoading ? (
                        Array.from({ length: 2 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-11 rounded-lg"
                            />
                        ))
                    ) : (
                        archivedItems.map((item) => (
                            <div
                                key={item.id}
                                className="
                                    group flex items-center gap-2 rounded-lg
                                    border border-border-subtle bg-surface-muted/50 px-2.5 py-2
                                "
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-medium text-muted-foreground line-through decoration-border-strong">
                                        {item.title}
                                    </p>

                                    {item.description && (
                                        <p className="truncate text-[11px] text-muted-foreground/70">
                                            {item.description}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    size="xs"
                                    variant="ghost"
                                    aria-label={`Restore ${item.title}`}
                                    onClick={() =>
                                        void handleRestore(item.id, item.title)
                                    }
                                    disabled={restoreMutation.isPending}
                                    className="shrink-0"
                                >
                                    {restoreMutation.isPending ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <ArchiveRestore />
                                    )}
                                    Restore
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
