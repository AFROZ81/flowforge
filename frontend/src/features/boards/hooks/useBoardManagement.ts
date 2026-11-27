import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    archiveBoard,
    deleteBoard,
    restoreBoard,
    updateBoard,
    type UpdateBoardRequest,
} from "../api/board.service";

export function useBoardManagement(projectId: string) {
    const queryClient = useQueryClient();

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["boards", projectId] });
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["reports"] });
    };

    const update = useMutation({
        mutationFn: (data: UpdateBoardRequest) => updateBoard(data),
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({ queryKey: ["board", data.boardId] });
            queryClient.invalidateQueries({ queryKey: ["board-details", data.boardId] });
            invalidate();
        },
    });

    const archive = useMutation({
        mutationFn: (boardId: string) => archiveBoard(boardId, projectId),
        onSuccess: invalidate,
    });

    const restore = useMutation({
        mutationFn: (boardId: string) => restoreBoard(boardId, projectId),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: (boardId: string) => deleteBoard(boardId, projectId),
        onSuccess: (_, boardId) => {
            queryClient.removeQueries({ queryKey: ["board", boardId] });
            queryClient.removeQueries({ queryKey: ["board-details", boardId] });
            invalidate();
        },
    });

    return { update, archive, restore, remove };
}
