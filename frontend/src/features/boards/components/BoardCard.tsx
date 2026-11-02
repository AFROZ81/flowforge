import { LayoutDashboard } from "lucide-react";
import { Link } from "react-router";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { Board } from "../types/board";

type Props = {
    board: Board;
    projectId: string;
};

export default function BoardCard({ board, projectId }: Props) {
    return (
        <Card
            className="
                relative group/board h-full gap-0 border-border shadow-xs
                transition-[transform,border-color,box-shadow] duration-(--transition-normal)
                ease-(--ease-standard) hover:-translate-y-px hover:border-border-strong hover:shadow-sm
            "
        >
            <div className="flex items-start justify-between gap-3">
                <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary"
                >
                    <LayoutDashboard className="size-[18px]" strokeWidth={1.9} />
                </span>

                <Badge variant={board.archived ? "softNeutral" : "softBrand"}>
                    {board.archived ? "Archived" : "Active"}
                </Badge>
            </div>

            <h3 className="mt-4 truncate text-[15px] leading-snug font-semibold text-foreground">
                {board.name}
            </h3>

            <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                {board.description || "No description"}
            </p>

            {/*
             * One stretched link makes the whole card hittable while keeping
             * a single tab stop and an honest accessible name.
             */}
            <Link
                to={`/projects/${projectId}/boards/${board.id}`}
                className="absolute inset-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
                <span className="sr-only">
                    Open {board.name} board
                </span>
            </Link>
        </Card>
    );
}
