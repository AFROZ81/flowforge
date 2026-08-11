import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    addWorkItemWatcher,
} from "../api/workItemWatcher.service";

import type {
    AddWorkItemWatcherRequest,
} from "../types/workItemWatcher";

export function useAddWorkItemWatcher() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            data: AddWorkItemWatcherRequest
        ) =>
            addWorkItemWatcher(
                data
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