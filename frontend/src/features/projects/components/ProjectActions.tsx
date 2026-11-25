import { useState } from "react";
import { Archive, Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

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
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setEditing(true)}
                    disabled={isPending}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={`Edit ${project.name}`}
                    title="Edit project"
                >
                    <Pencil />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => archiveWithUndo(project)}
                    disabled={isPending}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Archive ${project.name}`}
                    title="Archive project"
                >
                    {isPending ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <Archive />
                    )}
                </Button>
            </div>

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
