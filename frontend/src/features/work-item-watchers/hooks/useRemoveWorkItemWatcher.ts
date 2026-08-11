import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    removeWorkItemWatcher,
} from "../api/workItemWatcher.service";

type RemoveWatcherMutation = {
    watcherId: string;
    workItemId: string;
};

export function useRemoveWorkItemWatcher() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            watcherId,
        }: RemoveWatcherMutation) =>
            removeWorkItemWatcher(
                watcherId
            ),

        onSuccess: (
            _,
            variables
        ) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "work-item-watchers",
                    variables.workItemId,
                ],
            });
        },
    });
}