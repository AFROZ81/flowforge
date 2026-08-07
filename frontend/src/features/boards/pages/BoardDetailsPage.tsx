import { useParams } from "react-router";

import ColumnGrid from "../components/ColumnGrid";
import { useBoardDetails } from "../hooks/useBoardDetails";

export default function BoardDetailsPage() {
    const { boardId } = useParams();

    const {
        data: board,
        isLoading,
        isError,
    } = useBoardDetails(boardId!);

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                Loading board...
            </div>
        );
    }

    if (isError || !board) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                Board not found.
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">

            <div>

                <h1 className="text-4xl font-bold">
                    {board.name}
                </h1>

                {board.description && (
                    <p className="mt-2 text-muted-foreground">
                        {board.description}
                    </p>
                )}

            </div>

            <ColumnGrid columns={board.columns} />

        </div>
    );
}