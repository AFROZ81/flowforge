import { useQuery } from "@tanstack/react-query";

import { getBoards } from "../api/board.service";

export function useBoards(
    projectId: string
) {
    return useQuery({
        queryKey: [
            "boards",
            projectId,
        ],

        queryFn: () =>
            getBoards(projectId),

        enabled: !!projectId,
    });
}