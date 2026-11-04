import { useMutation, useQueryClient } from "@tanstack/react-query";
import { archiveProject } from "../api/project.service";

/**
 * Hides a project from the list. Nothing is deleted and the row can come back
 * through `useRestoreProject`, which is why the caller offers Undo in its toast
 * instead of asking for confirmation first.
 */
export function useArchiveProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: archiveProject,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["projects"],
            });
        },
    });
}
