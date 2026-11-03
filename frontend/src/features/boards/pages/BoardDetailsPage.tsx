import {
    useEffect,
} from "react";

import {
    Link,
    useParams,
} from "react-router";

import { ArrowLeft } from "lucide-react";

import ColumnGrid from "../components/ColumnGrid";
import { useBoardDetails } from "../hooks/useBoardDetails";

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


                    {/* Board Presence */}

                    <div className="
                        shrink-0
                        pt-1
                    ">

                        <BoardPresence />

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