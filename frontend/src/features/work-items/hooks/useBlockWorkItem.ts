import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    blockWorkItem,
} from "../api/workItem.service";

import type {
    BoardDetails,
} from "@/features/boards/types/boardDetails";

import type {
    WorkItem,
} from "@/features/work-items/types/workItem";

export function useBlockWorkItem() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: blockWorkItem,

        onMutate: async (workItemId: string) => {

            await queryClient.cancelQueries({
                queryKey: [
                    "work-item",
                    workItemId,
                ],
            });

            const previousWorkItem =
                queryClient.getQueryData<WorkItem>([
                    "work-item",
                    workItemId,
                ]);

            if (
                previousWorkItem
            ) {

                queryClient.setQueryData<WorkItem>([
                    "work-item",
                    workItemId,
                ], {
                    ...previousWorkItem,

                    status: 3,

                    updatedAt: new Date().toISOString(),
                });
            }

            const previousBoardDetails =
                queryClient.getQueryData<BoardDetails>([
                    "board-details",
                ]);

            if (
                previousBoardDetails &&
                previousWorkItem
            ) {

                const updatedColumns =
                    previousBoardDetails.columns
                        .map(column => {

                            const workItemIndex =
                                column.workItems.findIndex(
                                    wi => wi.id === workItemId
                                );

                                if (
                                    workItemIndex === -1
                                ) {
                                    return column;
                                }

                                const workItem =
                                    column.workItems[workItemIndex];

                                return {
                                    ...column,

                                    workItems: [
                                        ...column.workItems.slice(
                                            0,
                                            workItemIndex
                                        ),

                                        {
                                            ...workItem,

                    status: 3,
                                        },

                                        ...column.workItems.slice(
                                            workItemIndex + 1
                                        ),
                                    ],
                                };
                        });

                queryClient.setQueryData<BoardDetails>([
                    "board-details",
                ], {
                    ...previousBoardDetails,

                    columns: updatedColumns,
                });
            }

            return {
                previousWorkItem,
                previousBoardDetails,
            };
        },

        onError: (_, _variables, context) => {

            if (
                context?.previousWorkItem
            ) {
                queryClient.setQueryData<WorkItem>([
                    "work-item",
                    _variables,
                ], context.previousWorkItem);
            }

            if (
                context?.previousBoardDetails
            ) {
                queryClient.setQueryData<BoardDetails>([
                    "board-details",
                ], context.previousBoardDetails);
            }
        },

        onSuccess: (_data, workItemId) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "work-item",
                    workItemId,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "board-details",
                ],
            });
        },
    });
}
