import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    updateLabel,
} from "../api/label.service";

import type {
    UpdateLabelRequest,
} from "../types/label";

import { LABELS_QUERY_KEY } from "./useLabels";

export const useUpdateLabel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: UpdateLabelRequest;
        }) => updateLabel(id, data),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: LABELS_QUERY_KEY,
            });
        },
    });
};