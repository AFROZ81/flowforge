import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    deleteLabel,
} from "../api/label.service";

import { LABELS_QUERY_KEY } from "./useLabels";

export const useDeleteLabel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            deleteLabel(id),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: LABELS_QUERY_KEY,
            });
        },
    });
};