import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    assignWorkItem,
} from "../api/workItem.service";

import type {
    BoardDetails,
    BoardWorkItem,
} from "@/features/boards/types/boardDetails";

import type {
    WorkItem,
} from "@/features/work-items/types/workItem";

type AssignWorkItemRequest = {
    workItemId: string;
    userId: string;
};

export function useAssignWorkItem() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            workItemId,
            userId,
        }: AssignWorkItemRequest) =>
            assignWorkItem(
                workItemId,
                userId
            ),

        onMutate: async ({
            workItemId,
            userId,
        }: AssignWorkItemRequest) => {

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

                    assigneeId: userId,

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

                                const updatedWorkItem: BoardWorkItem =
                                    {
                                        ...workItem,

                                        assigneeId: userId,
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
                    _variables.workItemId,
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

        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "work-item",
                    variables.workItemId,
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
