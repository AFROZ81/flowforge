import { useCallback } from "react";
import { toast } from "sonner";

import { normalizeError } from "@/lib/errors";

import { useArchiveProject } from "./useArchiveProject";
import { useRestoreProject } from "./useRestoreProject";

type Target = { id: string; name: string };

/**
 * Archive a project, with the way back inside the toast.
 *
 * Both places that can archive — the row menu and the detail header — need the
 * same Undo behaviour, and a second copy is how one of them ends up archiving
 * with no way to undo it. `onArchived` runs first, so the detail page can leave
 * before its own subject disappears.
 */
export function useArchiveProjectWithUndo() {
    const { mutate: archive, isPending } = useArchiveProject();
    const { mutate: restore } = useRestoreProject();

    const archiveWithUndo = useCallback(
        (project: Target, onArchived?: () => void) => {
            archive(project.id, {
                onSuccess: () => {
                    onArchived?.();

                    toast.success("Project archived", {
                        description: project.name,
                        duration: 8000,
                        action: {
                            label: "Undo",
                            onClick: () => {
                                restore(project.id, {
                                    onSuccess: () => {
                                        toast.success("Project restored", {
                                            description: project.name,
                                        });
                                    },
                                    onError: (error) => {
                                        const { title, description } =
                                            normalizeError(error, {
                                                title:
                                                    "Couldn't restore that project",
                                                description:
                                                    "Try again from the actions menu.",
                                            });

                                        toast.error(title, { description });
                                    },
                                });
                            },
                        },
                    });
                },
                onError: (error) => {
                    const { title, description } = normalizeError(error, {
                        title: "Couldn't archive that project",
                        description: "Check the details and try again.",
                    });

                    toast.error(title, { description });
                },
            });
        },
        [archive, restore]
    );

    return { archiveWithUndo, isPending };
}
