import { useMutation } from "@tanstack/react-query";

import {
    createWorkItem,
    type CreateWorkItemRequest,
} from "../api/workItem.service";

export function useCreateWorkItem() {
    return useMutation({
        mutationFn: (
            data: CreateWorkItemRequest
        ) => createWorkItem(data),
    });
}