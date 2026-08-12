import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    createLabel,
} from "../api/label.service";

import type {
    CreateLabelRequest,
} from "../types/label";

import { LABELS_QUERY_KEY } from "./useLabels";

export const useCreateLabel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (
            data: CreateLabelRequest
        ) => createLabel(data),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: LABELS_QUERY_KEY,
            });
        },
    });
};