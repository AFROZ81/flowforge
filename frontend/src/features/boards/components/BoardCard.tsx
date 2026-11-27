import { useState } from "react";
import { Archive, ArchiveRestore, LayoutDashboard, Loader2, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/common/confirm";
import { toast } from "@/lib/toast";
import { normalizeError } from "@/lib/errors";
import { useAuthStore } from "@/stores/auth.store";
import { isAdminRole } from "@/lib/auth-roles";
import { cn } from "@/lib/utils";

import { useBoardManagement } from "../hooks/useBoardManagement";
import EditBoardDialog from "./EditBoardDialog";

import type { Board } from "../types/board";

type Props = {
    board: Board;
    projectId: string;
};

export default function BoardCard({ board, projectId }: Props) {
    const [editing, setEditing] = useState(false);
    const confirm = useConfirm();
    const currentUserRole = useAuthStore((state) => state.user?.role);
    const isAdmin = isAdminRole(currentUserRole);
    const { update, archive, restore, remove } = useBoardManagement(projectId);
    const isBusy = update.isPending || archive.isPending || restore.isPending || remove.isPending;

    const handleEdit = () => {
        if (!isAdmin || isBusy || board.isArchived) return;
        setEditing(true);
    };

    const handleArchive = async () => {
        if (!isAdmin || isBusy || board.isArchived) return;

        try {
            await archive.mutateAsync(board.id);
            toast.success("Board archived.");
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: "Couldn't archive that board",
            });
            toast.error(title, { description });
        }
    };

    const handleRestore = async () => {
        if (!isAdmin || isBusy || !board.isArchived) return;

        try {
            await restore.mutateAsync(board.id);
            toast.success("Board restored.");
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: "Couldn't restore that board",
            });
            toast.error(title, { description });
        }
    };

    const handleDelete = async () => {
        if (!isAdmin || isBusy) return;

        const confirmed = await confirm({
            title: `Delete “${board.name}”?`,
            description:
                "This soft-deletes the board and retains its data. The API blocks deletion while active columns remain.",
            confirmLabel: "Delete",
            confirmationText: board.name,
            tone: "destructive",
        });

        if (!confirmed) return;

        try {
            await remove.mutateAsync(board.id);
            toast.success("Board deleted.");
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: "Couldn't delete that board",
                description: "Nothing was deleted. Check whether it still contains columns.",
            });
            toast.error(title, { description });
        }
    };

    return (
        <Card
            className="
                group/board relative flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs
                transition-[transform,border-color,box-shadow] duration-(--transition-normal)
                ease-(--ease-standard) hover:-translate-y-px hover:border-border-strong hover:shadow-sm
                focus-within:border-border-strong
            "
        >
            <Link
                to={`/projects/${projectId}/boards/${board.id}`}
                className="
                    flex min-w-0 flex-1 flex-col gap-3 rounded-lg
                    outline-none after:absolute after:inset-0 after:content-['']
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
                "
            >
                <div className="flex items-center gap-3">
                    <span
                        aria-hidden="true"
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary"
                    >
                        <LayoutDashboard className="size-[18px]" strokeWidth={1.9} />
                    </span>

                    <div className="min-w-0 flex-1">
                        <h3 className="min-w-0 truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                            {board.name}
                        </h3>
                    </div>
                </div>

                <p
                    className={cn(
                        "line-clamp-2 text-xs leading-relaxed",
                        board.description?.trim()
                            ? "text-muted-foreground"
                            : "text-muted-foreground/50 italic"
                    )}
                >
                    {board.description?.trim() || "No description"}
                </p>
            </Link>

            <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                <Badge variant={board.isArchived ? "softNeutral" : "softBrand"}>
                    {board.isArchived ? "Archived" : "Active"}
                </Badge>

                {isAdmin && (
                    <span className="relative z-10 shrink-0">
                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={handleEdit}
                                disabled={isBusy || board.isArchived}
                                className="text-muted-foreground hover:text-foreground"
                                aria-label={`Edit ${board.name}`}
                                title={board.isArchived ? "Restore board to edit" : "Edit board"}
                            >
                                <Pencil />
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={board.isArchived ? () => void handleRestore() : handleArchive}
                                disabled={isBusy}
                                className="text-muted-foreground hover:text-warning-foreground"
                                aria-label={board.isArchived ? `Restore ${board.name}` : `Archive ${board.name}`}
                                title={board.isArchived ? "Restore board" : "Archive board"}
                            >
                                {archive.isPending || restore.isPending ? (
                                    <Loader2 className="animate-spin" />
                                ) : board.isArchived ? (
                                    <ArchiveRestore />
                                ) : (
                                    <Archive />
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => void handleDelete()}
                                disabled={isBusy}
                                className="text-muted-foreground hover:text-destructive"
                                aria-label={`Delete ${board.name}`}
                                title="Delete board"
                            >
                                {remove.isPending ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <Trash2 />
                                )}
                            </Button>
                        </div>
                    </span>
                )}
            </div>

            {editing && isAdmin && (
                <EditBoardDialog
                    key={board.id}
                    open={editing}
                    onOpenChange={setEditing}
                    projectId={projectId}
                    board={board}
                />
            )}
        </Card>
    );
}
