import { useState } from "react";
import { Archive, ArchiveRestore, KanbanSquare, LayoutDashboard, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { normalizeError } from "@/lib/errors";
import { toast } from "@/lib/toast";
import { isAdminRole } from "@/lib/auth-roles";
import { useAuthStore } from "@/stores/auth.store";

import { useBoards } from "../hooks/useBoards";
import { useBoardManagement } from "../hooks/useBoardManagement";

import BoardCard from "./BoardCard";
import CreateBoardDialog from "./CreateBoardDialog";

import type { Board } from "../types/board";

type Props = {
    projectId: string;
};

export default function BoardGrid({ projectId }: Props) {
    const [open, setOpen] = useState(false);
    const [archivedOpen, setArchivedOpen] = useState(false);
    const currentUserRole = useAuthStore((state) => state.user?.role);
    const isAdmin = isAdminRole(currentUserRole);

    const { data: boards = [], isLoading, error, refetch } =
        useBoards(projectId, isAdmin);

    const activeBoards = boards.filter((board) => !board.isArchived);
    const archivedBoards = boards.filter((board) => board.isArchived);

    const openCreate = () => {
        if (!isAdmin) return;
        setOpen(true);
    };

    const handleOpenChange = (value: boolean) => {
        if (value && !isAdmin) return;
        setOpen(value);
    };

    const renderCards = (items: typeof boards) => (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((board) => (
                <BoardCard
                    key={board.id}
                    board={board}
                    projectId={projectId}
                />
            ))}
        </div>
    );

    const renderSkeletons = () => (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                    key={index}
                    className="h-[136px] rounded-xl"
                />
            ))}
        </div>
    );

    return (
        <section className="space-y-6" aria-label="Boards">
            <div className="space-y-4">
                <SectionHeader
                    title={`Boards${isLoading ? "" : ` · ${activeBoards.length}`}`}
                    description="Each board holds its own columns and work items."
                    action={
                        isAdmin ? (
                            <div className="flex items-center gap-2">
                                {archivedBoards.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setArchivedOpen(true)}
                                    >
                                        <Archive />
                                        Archived ({archivedBoards.length})
                                    </Button>
                                )}
                                <Button size="sm" onClick={openCreate}>
                                    New Board
                                </Button>
                            </div>
                        ) : undefined
                    }
                />

                {error ? (
                    <ErrorState
                        error={error}
                        title="We couldn't load the boards on this project"
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
                ) : isLoading ? (
                    renderSkeletons()
                ) : activeBoards.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card shadow-xs">
                        <EmptyState
                            icon={KanbanSquare}
                            title="No active boards"
                            description="Create a board to start adding columns and work items."
                            action={
                                isAdmin ? (
                                    <Button onClick={openCreate}>
                                        Create Board
                                    </Button>
                                ) : undefined
                            }
                            size="sm"
                            className="py-10"
                        />
                    </div>
                ) : (
                    renderCards(activeBoards)
                )}
            </div>

            {isAdmin && (
                <>
                    <ArchivedBoardsDialog
                        open={archivedOpen}
                        onOpenChange={setArchivedOpen}
                        projectId={projectId}
                        boards={archivedBoards}
                    />
                    <CreateBoardDialog
                        open={open}
                        onOpenChange={handleOpenChange}
                        projectId={projectId}
                    />
                </>
            )}
        </section>
    );
}

type ArchivedBoardsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    boards: Board[];
};

function ArchivedBoardsDialog({
    open,
    onOpenChange,
    projectId,
    boards,
}: ArchivedBoardsDialogProps) {
    const { restore } = useBoardManagement(projectId);

    const handleRestore = async (board: Board) => {
        if (restore.isPending) return;

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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Archived boards</DialogTitle>
                    <DialogDescription>
                        Restore a board to return it to the active list.
                    </DialogDescription>
                </DialogHeader>

                <DialogBody>
                    {boards.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            No archived boards.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {boards.map((board) => (
                                <li
                                    key={board.id}
                                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary"
                                    >
                                        <LayoutDashboard className="size-[18px]" strokeWidth={1.9} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {board.name}
                                        </p>
                                        {board.description?.trim() && (
                                            <p className="truncate text-xs text-muted-foreground">
                                                {board.description}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => void handleRestore(board)}
                                        disabled={restore.isPending}
                                        aria-label={`Restore ${board.name}`}
                                    >
                                        {restore.isPending && restore.variables === board.id ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <ArchiveRestore />
                                        )}
                                        Restore
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </DialogBody>

                <DialogFooter showCloseButton />
            </DialogContent>
        </Dialog>
    );
}
