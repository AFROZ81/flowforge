import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProject } from "../api/project.service";

export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProject,
        onSuccess: () => {
            /*
             * The whole collection rather than one row, matching useCreateProject.
             * React Query's structural sharing keeps untouched rows referentially
             * equal, so the refetch does not remount what did not change.
             */
            queryClient.invalidateQueries({
                queryKey: ["projects"],
            });
        },
    });
}
