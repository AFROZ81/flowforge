import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    createWorkItem,
    type CreateWorkItemRequest,
} from "../api/workItem.service";

import type {
    BoardDetails,
    BoardWorkItem,
} from "@/features/boards/types/boardDetails";

export function useCreateWorkItem() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            data: CreateWorkItemRequest
        ) => createWorkItem(data),

        onMutate: async (data: CreateWorkItemRequest) => {

            await queryClient.cancelQueries({
                queryKey: [
                    "board-details",
                ],
            });

            const previousBoardDetails =
                queryClient.getQueryData<BoardDetails>([
                    "board-details",
                ]);

            if (!previousBoardDetails) {
                return undefined;
            }

            const column =
                previousBoardDetails.columns.find(
                    col => col.id === data.columnId
                );

            if (!column) {
                return undefined;
            }

            const optimisticWorkItem: BoardWorkItem = {
                id: "optimistic-" + Date.now(),

                title: data.title,

                description: data.description ?? undefined,

                priority: data.priority,

                status: 1,

                displayOrder: 0,

                dueDate: data.dueDate ?? undefined,

                isArchived: false,
            };

            queryClient.setQueryData<BoardDetails>([
                "board-details",
            ], {
                ...previousBoardDetails,

                columns: previousBoardDetails.columns.map(col => {

                    if (
                        col.id === data.columnId
                    ) {

                        return {
                            ...col,

                            workItems: [
                                ...col.workItems,

                                optimisticWorkItem,
                            ],
                        };
                    }

                    return col;
                }),
            });

            return {
                previousBoardDetails,

                optimisticId: optimisticWorkItem.id,
            };
        },

        onError: (_, _variables, context) => {

            if (
                context?.previousBoardDetails
            ) {
                queryClient.setQueryData<BoardDetails>([
                    "board-details",
                ], context.previousBoardDetails);
            }
        },

        onSuccess: (data, _variables, context) => {

            if (
                context?.optimisticId &&
                data.id
            ) {

                queryClient.setQueryData<BoardDetails>([
                    "board-details",
                ], (old: BoardDetails | undefined) => {

                    if (!old) {
                        return old;
                    }

                    return {
                        ...old,

                        columns: old.columns.map(col => {

                            if (
                                col.id === _variables.columnId
                            ) {

                                return {
                                    ...col,

                                    workItems: col.workItems.map(wi => {

                                        if (
                                            wi.id === context!.optimisticId
                                        ) {

                                            return {
                                                ...data,

                                                displayOrder:
                                                    data.displayOrder ?? wi.displayOrder,
                                            } as BoardWorkItem;
                                        }

                                        return wi;
                                    }),
                                };
                            }

                            return col;
                        }),
                    };
                });
            }

            queryClient.invalidateQueries({
                queryKey: [
                    "board-details",
                ],
            });
        },
    });
}
