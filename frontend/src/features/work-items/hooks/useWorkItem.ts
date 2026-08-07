import { useQuery } from "@tanstack/react-query";

import { getWorkItem } from "../api/workItem.service";

export function useWorkItem(
    id: string
) {
    return useQuery({
        queryKey: [
            "work-item",
            id,
        ],

        queryFn: () =>
            getWorkItem(id),

        enabled: !!id,
    });
}