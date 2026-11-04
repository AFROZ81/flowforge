import { useState } from "react";
import { Archive, MoreHorizontal, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ProjectFormDialog from "./ProjectFormDialog";

import { useArchiveProjectWithUndo } from "../hooks/useArchiveProjectWithUndo";

import type { Project } from "../types/project";

type Props = {
    project: Project;
};

/**
 * Row actions: edit and archive.
 *
 * "Open project" is gone — the name in the very same row already links there.
 *
 * Archiving is reversible: the server keeps the project and exposes a restore
 * route, and the list simply stops returning it. So it acts immediately and
 * offers Undo in the toast, rather than interrupting for a confirmation of
 * something the user can take back in one click.
 */
export default function ProjectActions({ project }: Props) {
    const [editing, setEditing] = useState(false);
    const { archiveWithUndo, isPending } = useArchiveProjectWithUndo();

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    aria-label={`Actions for ${project.name}`}
                    render={
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                        />
                    }
                >
                    <MoreHorizontal />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="min-w-[184px]">
                    <DropdownMenuItem onClick={() => setEditing(true)}>
                        <Pencil />
                        Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        disabled={isPending}
                        onClick={() => archiveWithUndo(project)}
                    >
                        <Archive />
                        {isPending ? "Archiving…" : "Archive"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/*
             * Keyed to the row: opening the dialog for a different project
             * remounts it, so there is no chance of saving one project's edits
             * onto another.
             */}
            <ProjectFormDialog
                key={project.id}
                open={editing}
                onOpenChange={setEditing}
                project={project}
            />
        </>
    );
}
