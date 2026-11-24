import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    moveWorkItem,
    type MoveWorkItemRequest,
} from "../api/workItem.service";

import type {
    BoardDetails,
} from "@/features/boards/types/boardDetails";

type MoveWorkItemMutation = {
    id: string;
    data: MoveWorkItemRequest;
};

export function useMoveWorkItem() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: MoveWorkItemMutation) =>
            moveWorkItem(id, data),

        onMutate: async ({
            id,
            data,
        }: MoveWorkItemMutation) => {

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

            const workItemToMove =
                previousBoardDetails.columns
                    .flatMap(
                        col => col.workItems
                    )
                    .find(
                        wi => wi.id === id
                    );

            if (!workItemToMove) {
                return undefined;
            }

            const updatedColumns =
                previousBoardDetails.columns
                    .map(column => {

                        if (
                            column.workItems.some(
                                wi => wi.id === id
                            )
                        ) {

                            return {
                                ...column,

                                workItems: column.workItems
                                    .filter(
                                        wi => wi.id !== id
                                    ),
                            };
                        }

                        return column;
                    });

            const destinationColumnIndex =
                updatedColumns.findIndex(
                    col =>
                        col.id === data.destinationColumnId
                );

            if (
                destinationColumnIndex === -1
            ) {

                queryClient.setQueryData<BoardDetails>([
                    "board-details",
                ], previousBoardDetails);

                return undefined;
            }

            const destinationColumn =
                updatedColumns[destinationColumnIndex];

            const destinationWorkItems =
                [...destinationColumn.workItems];

            destinationWorkItems.splice(
                data.destinationIndex,
                0,
                workItemToMove
            );

            updatedColumns[destinationColumnIndex] = {
                ...destinationColumn,

                workItems: destinationWorkItems,
            };

            queryClient.setQueryData<BoardDetails>([
                "board-details",
            ], {
                ...previousBoardDetails,

                columns: updatedColumns,
            });

            return {
                previousBoardDetails,
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

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "work-item",
                    variables.id,
                ],
            });
        },
    });
}
