import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteProject } from "../api/project.service";

export function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteProject,
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: ["project", id] });
            queryClient.removeQueries({ queryKey: ["boards", id] });
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["reports"] });
        },
    });
}
