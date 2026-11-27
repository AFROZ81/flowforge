import { useState } from "react";
import { Archive, ArchiveRestore, Loader2, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import ProjectFormDialog from "./ProjectFormDialog";
import { useDeleteProject } from "../hooks/useDeleteProject";
import { useRestoreProject } from "../hooks/useRestoreProject";
import { useConfirm } from "@/components/common/confirm";
import { toast } from "@/lib/toast";
import { normalizeError } from "@/lib/errors";
import { useAuthStore } from "@/stores/auth.store";
import { isAdminRole } from "@/lib/auth-roles";

import { useArchiveProjectWithUndo } from "../hooks/useArchiveProjectWithUndo";

import type { Project } from "../types/project";

type Props = {
    project: Project;
};

/**
 * Direct card actions: edit, archive/restore, and soft delete.
 *
 * "Open project" is gone — the name in the very same row already links there.
 * Archiving remains reversible and offers Undo in the toast; soft delete
 * always requires exact-name confirmation and retains the record.
 */
export default function ProjectActions({ project }: Props) {
    const [editing, setEditing] = useState(false);
    const { archiveWithUndo, isPending: archivePending } = useArchiveProjectWithUndo();
    const restoreMutation = useRestoreProject();
    const deleteMutation = useDeleteProject();
    const confirm = useConfirm();
    const currentUserRole = useAuthStore((state) => state.user?.role);
    const isAdmin = isAdminRole(currentUserRole);
    const isBusy = archivePending || restoreMutation.isPending || deleteMutation.isPending;

    const handleEdit = () => {
        if (!isAdmin || isBusy) return;
        setEditing(true);
    };

    const handleArchive = () => {
        if (!isAdmin || isBusy || project.archived) return;
        archiveWithUndo(project);
    };

    const handleRestore = async () => {
        if (!isAdmin || isBusy || !project.archived) return;

        try {
            await restoreMutation.mutateAsync(project.id);
            toast.success("Project restored.");
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: "Couldn't restore that project",
            });
            toast.error(title, { description });
        }
    };

    const handleDelete = async () => {
        if (!isAdmin || isBusy) return;

        const boardCount = project.boardCount;
        const impact = boardCount === undefined
            ? "The API blocks deletion while boards still exist."
            : `This project contains ${boardCount} board${boardCount === 1 ? "" : "s"}. Deletion is blocked while any board remains.`;

        const confirmed = await confirm({
            title: `Delete “${project.name}”?`,
            description: `${impact} The project and its data will be soft-deleted and retained.`,
            confirmLabel: "Delete",
            confirmationText: project.name,
            tone: "destructive",
        });

        if (!confirmed) return;

        try {
            await deleteMutation.mutateAsync(project.id);
            toast.success("Project deleted.");
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: "Couldn't delete that project",
                description: "Nothing was deleted. Check whether it still contains boards.",
            });
            toast.error(title, { description });
        }
    };

    if (!isAdmin) return null;

    return (
        <>
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleEdit}
                    disabled={isBusy}
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
                    onClick={project.archived ? () => void handleRestore() : handleArchive}
                    disabled={isBusy}
                    className="text-muted-foreground hover:text-warning-foreground"
                    aria-label={project.archived ? `Restore ${project.name}` : `Archive ${project.name}`}
                    title={project.archived ? "Restore project" : "Archive project"}
                >
                    {archivePending || restoreMutation.isPending ? (
                        <Loader2 className="animate-spin" />
                    ) : project.archived ? (
                        <ArchiveRestore />
                    ) : (
                        <Archive />
                    )}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => void handleDelete()}
                    disabled={isBusy}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${project.name}`}
                    title="Delete project"
                >
                    {deleteMutation.isPending ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <Trash2 />
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
                open={editing && isAdmin}
                onOpenChange={setEditing}
                project={project}
            />
        </>
    );
}
