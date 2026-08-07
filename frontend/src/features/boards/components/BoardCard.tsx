import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard } from "lucide-react";
import { Link } from "react-router";

import type { Board } from "../types/board";

type Props = {
    board: Board;
    projectId: string;
};

export default function BoardCard({
    board,
    projectId,
}: Props) {
    return (
        <Link
            to={`/projects/${projectId}/boards/${board.id}`}
        >
            <Card className="rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-lg">

                <div className="flex items-center justify-between">

                    <LayoutDashboard
                        className="text-blue-600"
                        size={28}
                    />

                    <Badge
                        variant={
                            board.archived
                                ? "secondary"
                                : "default"
                        }
                    >
                        {board.archived
                            ? "Archived"
                            : "Active"}
                    </Badge>

                </div>

                <h3 className="mt-5 text-lg font-semibold">
                    {board.name}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                    {board.description ||
                        "No description"}
                </p>

            </Card>
        </Link>
    );
}