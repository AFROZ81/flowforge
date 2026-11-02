import { useState } from "react";

import { KanbanSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";

import { useBoards } from "../hooks/useBoards";

import BoardCard from "./BoardCard";
import CreateBoardDialog from "./CreateBoardDialog";

type Props = {
    projectId: string;
};

export default function BoardGrid({ projectId }: Props) {
    const [open, setOpen] = useState(false);

    const { data: boards = [], isLoading, error, refetch } =
        useBoards(projectId);

    return (
        <section className="space-y-4" aria-label="Boards">
            <SectionHeader
                title={`Boards${isLoading ? "" : ` · ${boards.length}`}`}
                description="Each board holds its own columns and work items."
                action={
                    <Button size="sm" onClick={() => setOpen(true)}>
                        New Board
                    </Button>
                }
            />

            {error ? (
                <ErrorState
                    error={error}
                    title="We couldn't load the boards on this project"
                    action={
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void refetch()}
                        >
                            Try again
                        </Button>
                    }
                />
            ) : isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            className="h-[136px] rounded-xl"
                        />
                    ))}
                </div>
            ) : boards.length === 0 ? (
                <div className="rounded-xl border border-border bg-card shadow-xs">
                    <EmptyState
                        icon={KanbanSquare}
                        title="No boards yet"
                        description="A board is where the work lives — create one to start adding columns and work items."
                        action={
                            <Button onClick={() => setOpen(true)}>
                                Create Board
                            </Button>
                        }
                        size="sm"
                        className="py-10"
                    />
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {boards.map((board) => (
                        <BoardCard
                            key={board.id}
                            board={board}
                            projectId={projectId}
                        />
                    ))}
                </div>
            )}

            <CreateBoardDialog
                open={open}
                onOpenChange={setOpen}
                projectId={projectId}
            />
        </section>
    );
}
