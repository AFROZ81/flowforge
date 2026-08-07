import { useState } from "react";

import { Button } from "@/components/ui/button";

import { useBoards } from "../hooks/useBoards";

import BoardCard from "./BoardCard";
import CreateBoardDialog from "./CreateBoardDialog";

type Props = {
    projectId: string;
};

export default function BoardGrid({
    projectId,
}: Props) {
    const [open, setOpen] =
        useState(false);

    const { data, isLoading } =
        useBoards(projectId);

    if (isLoading) {
        return (
            <div>
                Loading boards...
            </div>
        );
    }

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                    Boards
                </h2>

                <Button onClick={() => setOpen(true)}>
                    New Board
                </Button>
            </div>

            {data?.length ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {data.map((board) => (
                        <BoardCard
                            key={board.id}
                            board={board}
                            projectId={projectId}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed p-12 text-center text-slate-500">
                    No boards yet.
                </div>
            )}

            <CreateBoardDialog
                open={open}
                onOpenChange={setOpen}
                projectId={projectId}
            />
        </>
    );
}