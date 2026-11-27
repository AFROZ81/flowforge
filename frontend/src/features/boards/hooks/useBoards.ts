import { useQuery } from "@tanstack/react-query";

import { getBoards } from "../api/board.service";

export function useBoards(
    projectId: string,
    includeArchived = false
) {
    return useQuery({
        queryKey: [
            "boards",
            projectId,
            includeArchived,
        ],

        queryFn: () =>
            getBoards(projectId, includeArchived),

        enabled: !!projectId,
    });
}