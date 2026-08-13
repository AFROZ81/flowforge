import {
    useEffect,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router";

import ColumnGrid from "../components/ColumnGrid";
import { useBoardDetails } from "../hooks/useBoardDetails";

import BoardPresence from "@/features/presence/components/BoardPresence";
import {
    usePresenceContext,
} from "@/features/presence/context/PresenceContext";


export default function BoardDetailsPage() {

    const {
        boardId,
    } = useParams();


    const navigate =
        useNavigate();


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
        );
    }


    /* =====================================================
       PAGE
       ===================================================== */

    return (

        <div className="
            space-y-8
            p-6
        ">

            {/* =================================================
               BOARD HEADER
               ================================================= */}

            <div>

                {/* Back */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(-1)
                    }
                    className="
                        mb-4
                        inline-flex
                        items-center
                        gap-2
                        rounded-lg
                        px-3
                        py-2
                        text-sm
                        font-medium
                        text-gray-500
                        transition
                        hover:bg-gray-100
                        hover:text-gray-900
                    "
                >

                    <span className="
                        text-base
                        leading-none
                    ">
                        ←
                    </span>

                    <span>
                        Boards
                    </span>

                </button>


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
                            text-gray-900
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
    );
}