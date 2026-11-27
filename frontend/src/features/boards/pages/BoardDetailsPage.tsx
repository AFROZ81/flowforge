import {
    useEffect,
} from "react";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router";

import { ArrowLeft, Loader2, Trash2 } from "lucide-react";

import ColumnGrid from "../components/ColumnGrid";
import { useBoardDetails } from "../hooks/useBoardDetails";
import { useBoardManagement } from "../hooks/useBoardManagement";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/common/confirm";
import { toast } from "@/lib/toast";
import { normalizeError } from "@/lib/errors";
import { useAuthStore } from "@/stores/auth.store";
import { isAdminRole } from "@/lib/auth-roles";

import DetailLayout from "@/layouts/DetailLayout";

import BoardPresence from "@/features/presence/components/BoardPresence";
import {
    usePresenceContext,
} from "@/features/presence/context/PresenceContext";


export default function BoardDetailsPage() {

    const {
        projectId,
        boardId,
    } = useParams();
    const navigate = useNavigate();
    const currentUserRole = useAuthStore((state) => state.user?.role);
    const isAdmin = isAdminRole(currentUserRole);
    const confirm = useConfirm();
    const { remove } = useBoardManagement(projectId ?? "");
    const isManaging = remove.isPending;

    const {
        data: board,
        isLoading,
        isError,
    } = useBoardDetails(
        boardId!
    );


    const {
        joinBoard,
        leaveBoard,
    } = usePresenceContext();


    /* =====================================================
       JOIN / LEAVE BOARD PRESENCE
       ===================================================== */

    useEffect(() => {

        if (!boardId) {
            return;
        }


        /*
         * Tell SignalR that this user is
         * currently viewing this board.
         */
        joinBoard(
            boardId
        );


        /*
         * When the user leaves the page,
         * tell SignalR to remove them from
         * this board.
         */
        return () => {

            leaveBoard(
                boardId
            );

        };

    }, [
        boardId,
        joinBoard,
        leaveBoard,
    ]);


    const handleDelete = async () => {
        if (!isAdmin || !board) return;

        const columnCount = board.columns.length;
        const workItemCount = board.columns.reduce(
            (total: number, column: { workItems: unknown[] }) => total + column.workItems.length,
            0
        );

        const confirmed = await confirm({
            title: `Delete “${board.name}”?`,
            description:
                `This board contains ${columnCount} column${columnCount === 1 ? "" : "s"} and ${workItemCount} work item${workItemCount === 1 ? "" : "s"}. This soft-deletes the board and retains its data. Deletion is blocked while active columns remain.`,
            confirmLabel: "Delete",
            confirmationText: board.name,
            tone: "destructive",
        });

        if (!confirmed) return;

        try {
            await remove.mutateAsync(board.id);
            toast.success("Board deleted.");
            navigate(`/projects/${projectId}`);
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: "Couldn't delete that board",
                description: "Nothing was deleted. Check whether it still contains columns.",
            });
            toast.error(title, { description });
        }
    };

    /* =====================================================
       LOADING
       ===================================================== */

    if (isLoading) {

        return (
            <DetailLayout>
                <div className="
                    flex
                    h-[60vh]
                    items-center
                    justify-center
                    text-sm
                    text-muted-foreground
                ">
                    Loading board...
                </div>
            </DetailLayout>
        );
    }


    /* =====================================================
       ERROR
       ===================================================== */

    if (
        isError ||
        !board
    ) {

        return (
            <DetailLayout>
                <div className="
                    flex
                    h-[60vh]
                    items-center
                    justify-center
                    text-sm
                    text-muted-foreground
                ">
                    Board not found.
                </div>
            </DetailLayout>
        );
    }


    /* =====================================================
       PAGE
       ===================================================== */

    return (

        <DetailLayout>

        <div className="
            space-y-6
        ">

            {/* =================================================
               BOARD HEADER
               ================================================= */}

            <div>

                {/* Back */}

                <Link
                    to={`/projects/${projectId}`}
                    className="
                        mb-4
                        inline-flex
                        h-8
                        items-center
                        gap-1.5
                        rounded-lg
                        -mx-2
                        px-2
                        text-[13px]
                        font-medium
                        text-muted-foreground
                        transition-colors
                        hover:bg-surface-muted
                        hover:text-foreground
                        focus-visible:outline-2
                        focus-visible:outline-offset-2
                        focus-visible:outline-ring
                    "
                >

                    <ArrowLeft
                        className="size-4"
                        aria-hidden="true"
                    />

                    <span>
                        Boards
                    </span>

                </Link>


                {/* =================================================
                   TITLE + PRESENCE
                   ================================================= */}

                <div className="
                    flex
                    items-start
                    justify-between
                    gap-6
                ">

                    <div className="
                        min-w-0
                    ">

                        <h1 className="
                            text-4xl
                            font-bold
                            text-foreground
                        ">
                            {board.name}
                        </h1>


                        {board.description && (
                            <p className="
                                mt-2
                                text-sm
                                text-muted-foreground
                            ">
                                {
                                    board.description
                                }
                            </p>
                        )}

                    </div>


                    {/* Presence and Admin actions */}

                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 pt-1">
                        <BoardPresence />

                        {isAdmin && (
                            <>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => void handleDelete()}
                                    disabled={isManaging}
                                >
                                    {remove.isPending ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="size-4" />
                                    )}
                                    {remove.isPending ? "Deleting..." : "Delete"}
                                </Button>
                            </>
                        )}
                    </div>

                </div>

            </div>


            {/* =================================================
               BOARD COLUMNS
               ================================================= */}

            <ColumnGrid
                columns={
                    board.columns
                }
            />

        </div>

        </DetailLayout>
    );
}