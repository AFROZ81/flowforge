import { useQuery } from "@tanstack/react-query";

import { getWorkItems } from "../api/workItem.service";

export function useWorkItems(
    boardId: string
) {
    return useQuery({
        queryKey: [
            "work-items",
            boardId,
        ],

        queryFn: () =>
            getWorkItems(boardId),

        enabled: !!boardId,
    });
}