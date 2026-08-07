import { useQuery } from "@tanstack/react-query";
import { getBoard } from "../api/boardDetails";

export function useBoard(id: string) {
    return useQuery({
        queryKey: ["board", id],
        queryFn: () => getBoard(id),
        enabled: !!id,
    });
}