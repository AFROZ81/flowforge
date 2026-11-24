import {
    useEffect,
} from "react";

import {
    useQueryClient,
} from "@tanstack/react-query";

export default function BoardRealtimeListener() {

    const queryClient =
        useQueryClient();

    useEffect(() => {

        const invalidateBoard = () => {

            void queryClient.invalidateQueries({
                queryKey: [
                    "board-details",
                ],
            });
        };

        window.addEventListener(
            "flowforge:work-item-moved",
            invalidateBoard
        );

        window.addEventListener(
            "flowforge:work-item-created",
            invalidateBoard
        );

        window.addEventListener(
            "flowforge:work-item-updated",
            invalidateBoard
        );

        window.addEventListener(
            "flowforge:work-item-deleted",
            invalidateBoard
        );

        window.addEventListener(
            "flowforge:comment-added",
            invalidateBoard
        );

        window.addEventListener(
            "flowforge:comment-updated",
            invalidateBoard
        );

        window.addEventListener(
            "flowforge:comment-deleted",
            invalidateBoard
        );

        return () => {

            window.removeEventListener(
                "flowforge:work-item-moved",
                invalidateBoard
            );

            window.removeEventListener(
                "flowforge:work-item-created",
                invalidateBoard
            );

            window.removeEventListener(
                "flowforge:work-item-updated",
                invalidateBoard
            );

            window.removeEventListener(
                "flowforge:work-item-deleted",
                invalidateBoard
            );

            window.removeEventListener(
                "flowforge:comment-added",
                invalidateBoard
            );

            window.removeEventListener(
                "flowforge:comment-updated",
                invalidateBoard
            );

            window.removeEventListener(
                "flowforge:comment-deleted",
                invalidateBoard
            );
        };

    }, [
        queryClient,
    ]);

    return null;
}
