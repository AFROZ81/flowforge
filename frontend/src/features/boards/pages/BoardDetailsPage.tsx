import { useParams } from "react-router";

import ColumnGrid from "../components/ColumnGrid";
import { useBoardDetails } from "../hooks/useBoardDetails";

import { useNavigate } from "react-router";

export default function BoardDetailsPage() {
    const { boardId } = useParams();
    const navigate = useNavigate();

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
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                >
                    <span className="text-base leading-none">
                        ←
                    </span>

                    <span>
                        Boards
                    </span>
                </button>

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