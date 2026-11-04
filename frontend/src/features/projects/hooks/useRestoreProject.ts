import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restoreProject } from "../api/project.service";

/**
 * Puts an archived project back in the list. Wired to the Undo action of the
 * archive toast, so it also stands alone if a restored view is ever added.
 */
export function useRestoreProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: restoreProject,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["projects"],
            });
        },
    });
}
