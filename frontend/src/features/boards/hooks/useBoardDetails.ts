import { useQuery } from "@tanstack/react-query";
import { getBoardDetails } from "../api/boardDetails.service";

export function useBoardDetails(boardId: string) {
    return useQuery({
        queryKey: ["board-details", boardId],
        queryFn: () => getBoardDetails(boardId),
        enabled: !!boardId,
    });
}