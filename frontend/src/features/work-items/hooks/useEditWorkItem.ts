import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    editWorkItem,
    type EditWorkItemRequest,
} from "../api/workItem.service";

import type {
    BoardDetails,
    BoardWorkItem,
} from "@/features/boards/types/boardDetails";

import type {
    WorkItem,
} from "@/features/work-items/types/workItem";

type EditWorkItemMutation = {
    id: string;
    data: EditWorkItemRequest;
};

export function useEditWorkItem() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: EditWorkItemMutation) =>
            editWorkItem(id, data),

        onMutate: async ({
            id,
            data,
        }: EditWorkItemMutation) => {

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

                    ...data,

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

                                        title:
                                            previousWorkItem.title,

                                        description:
                                            data.description ?? undefined,

                                        priority:
                                            data.priority ?? workItem.priority,

                                        dueDate:
                                            data.dueDate ?? workItem.dueDate ?? undefined,
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
                    _variables.id,
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

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "work-item",
                    variables.id,
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
