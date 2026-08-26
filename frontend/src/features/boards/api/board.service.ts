import api from "@/lib/api";
import type { Board } from "../types/board";


export type CreateBoardRequest = {
    projectId: string;
    name: string;
    description?: string;
};


/* =========================================================
   BOARD REQUEST CACHE
   ========================================================= */

/*
 * Short-lived cache.
 *
 * This prevents multiple components on the same page from
 * repeatedly requesting the same project's boards.
 *
 * Example:
 *
 * ProjectStats  ─┐
 * BoardGrid     ─┼──> getBoards(projectId)
 * RecentActivity ┘
 *
 * All three will reuse the same result.
 */
const boardCache =
    new Map<
        string,
        {
            data: Board[];
            expiresAt: number;
        }
    >();


/*
 * Requests currently in progress.
 *
 * If multiple components request the same project before
 * the first request finishes, they all receive the same
 * Promise instead of creating multiple HTTP requests.
 */
const inFlightBoardRequests =
    new Map<
        string,
        Promise<Board[]>
    >();


/*
 * Keep this short because boards can change.
 *
 * The purpose of this cache is NOT to keep data for a long
 * time. It only prevents duplicate requests caused by
 * multiple components mounting at the same time.
 */
const BOARD_CACHE_TTL_MS =
    5000;


/* =========================================================
   GET PROJECT BOARDS
   ========================================================= */

export const getBoards = async (
    projectId: string
): Promise<Board[]> => {

    if (!projectId) {
        return [];
    }


    /*
     * -------------------------------------------------------
     * 1. CHECK SHORT-LIVED CACHE
     * -------------------------------------------------------
     */

    const cached =
        boardCache.get(
            projectId
        );


    if (
        cached &&
        cached.expiresAt >
            Date.now()
    ) {

        return cached.data;
    }


    /*
     * -------------------------------------------------------
     * 2. CHECK FOR EXISTING REQUEST
     * -------------------------------------------------------
     *
     * This is the most important part.
     *
     * If ProjectStats, BoardGrid and RecentActivity all call
     * getBoards(projectId) at approximately the same time,
     * only ONE request will be sent to the backend.
     */

    const existingRequest =
        inFlightBoardRequests.get(
            projectId
        );


    if (
        existingRequest
    ) {

        return existingRequest;
    }


    /*
     * -------------------------------------------------------
     * 3. MAKE THE ACTUAL API REQUEST
     * -------------------------------------------------------
     */

    const request =
        api.get(
            "/Boards",
            {
                params: {
                    projectId,
                },
            }
        )
        .then(
            res => {

                /*
                 * Preserve your existing response structure:
                 *
                 * res.data.data.items
                 */

                const boards =
                    (
                        res.data?.data?.items ??
                        []
                    ) as Board[];


                /*
                 * Store successful result in the short-lived
                 * cache.
                 */

                boardCache.set(
                    projectId,
                    {
                        data: boards,

                        expiresAt:
                            Date.now() +
                            BOARD_CACHE_TTL_MS,
                    }
                );


                return boards;
            }
        )
        .finally(
            () => {

                /*
                 * The request is no longer in flight.
                 *
                 * Remove it regardless of success/failure.
                 */

                inFlightBoardRequests.delete(
                    projectId
                );
            }
        );


    /*
     * Store the Promise immediately.
     *
     * This is important because another component may call
     * getBoards() before the first HTTP request completes.
     */

    inFlightBoardRequests.set(
        projectId,
        request
    );


    return request;
};


/* =========================================================
   GET SINGLE BOARD
   ========================================================= */

export const getBoard = async (
    id: string
): Promise<Board> => {

    const res =
        await api.get(
            `/Boards/${id}`
        );


    return res.data.data;
};


/* =========================================================
   CREATE BOARD
   ========================================================= */

export const createBoard = async (
    data: CreateBoardRequest
): Promise<Board> => {

    const res =
        await api.post(
            "/Boards",
            data
        );


    /*
     * The project's board list is now stale.
     *
     * Remove it from the cache so the next getBoards()
     * retrieves the newly-created board.
     */

    boardCache.delete(
        data.projectId
    );


    return res.data.data;
};


/* =========================================================
   INVALIDATE PROJECT BOARDS
   ========================================================= */

/*
 * Call this after any operation that changes the project's
 * board list, for example:
 *
 * - update board
 * - archive board
 * - restore board
 * - delete board
 *
 * This lets the next getBoards() fetch fresh data.
 */

export const invalidateProjectBoards = (
    projectId: string
): void => {

    if (!projectId) {
        return;
    }


    boardCache.delete(
        projectId
    );
};


/* =========================================================
   CLEAR ALL BOARD CACHE
   ========================================================= */

/*
 * Useful after logout/login or when you need to guarantee
 * that no previously cached project board data remains.
 */

export const clearBoardCache = (): void => {

    boardCache.clear();
};