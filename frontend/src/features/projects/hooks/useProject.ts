import { useQuery } from "@tanstack/react-query";

import { getProjectById } from "../api/projectDetails";

export function useProject(id: string) {
    return useQuery({
        queryKey: ["project", id],
        queryFn: () => getProjectById(id),
        enabled: !!id,
    });
}