import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { archiveWorkItem } from "../api/workItem.service";

import type {
    BoardDetails,
    BoardWorkItem,
} from "@/features/boards/types/boardDetails";

import type {
    WorkItem,
} from "@/features/work-items/types/workItem";

export function useArchiveWorkItem() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            id: string
        ) => archiveWorkItem(id),

        onMutate: async (id: string) => {

            await queryClient.cancelQueries({
                queryKey: [
                    "work-item",
                    id,
                ],
            });

            const previousWorkItem =
                queryClient.getQueryData<WorkItem>([
                    "work-item",
                    id,
                ]);

            if (
                previousWorkItem
            ) {

                queryClient.setQueryData<WorkItem>([
                    "work-item",
                    id,
                ], {
                    ...previousWorkItem,

                    isArchived: true,

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
                                    wi => wi.id === id
                                );

                                if (
                                    workItemIndex === -1
                                ) {
                                    return column;
                                }

                                const workItem =
                                    column.workItems[workItemIndex];

                                const updatedWorkItem: BoardWorkItem =
                                    {
                                        ...workItem,

                                        isArchived: true,
                                    };

                                return {
                                    ...column,

                                    workItems: [
                                        ...column.workItems.slice(
                                            0,
                                            workItemIndex
                                        ),

                                        updatedWorkItem,

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

        onSuccess: (_, id) => {

            queryClient.invalidateQueries({
                queryKey: [
                    "work-item",
                    id,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "board-details",
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "archived-work-items",
                ],
            });
        },
    });
}
