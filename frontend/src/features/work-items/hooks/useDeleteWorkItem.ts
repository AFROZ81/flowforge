import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { BoardDetails } from "@/features/boards/types/boardDetails";
import { deleteWorkItem } from "../api/workItem.service";

export function useDeleteWorkItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteWorkItem,
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: ["work-item", id] });
            queryClient.removeQueries({ queryKey: ["attachments", id] });
            queryClient.removeQueries({ queryKey: ["archived-work-items"] });

            queryClient.setQueriesData<BoardDetails>(
                { queryKey: ["board-details"] },
                (board) =>
                    board
                        ? {
                              ...board,
                              columns: board.columns.map((column) => ({
                                  ...column,
                                  workItems: column.workItems.filter(
                                      (item) => item.id !== id
                                  ),
                              })),
                          }
                        : board
            );

            queryClient.invalidateQueries({ queryKey: ["board-details"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["reports"] });
        },
    });
}
