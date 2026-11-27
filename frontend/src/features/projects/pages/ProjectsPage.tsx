import { useMemo, useState } from "react";
import { Archive, ArchiveRestore, Loader2 } from "lucide-react";

import AppLayout from "@/layouts/AppLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ProjectMark } from "@/components/common/project-mark";
import { formatNumber } from "@/lib/format";
import { normalizeError } from "@/lib/errors";
import { toast } from "@/lib/toast";
import { isAdminRole } from "@/lib/auth-roles";
import { useAuthStore } from "@/stores/auth.store";

import { useProjects } from "../hooks/useProjects";
import { useRestoreProject } from "../hooks/useRestoreProject";

import ProjectTable from "../components/ProjectTable";
import ProjectToolbar, {
    type ProjectSortMode,
} from "../components/ProjectToolbar";
import ProjectFormDialog from "../components/ProjectFormDialog";

import type { Project } from "../types/project";

export default function ProjectsPage() {
    const {
        data: projects = [],
        isLoading,
        error,
        refetch,
    } = useProjects();

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<ProjectSortMode>("name-asc");
    const [open, setOpen] = useState(false);
    const [archivedOpen, setArchivedOpen] = useState(false);
    const currentUserRole = useAuthStore((state) => state.user?.role);
    const isAdmin = isAdminRole(currentUserRole);

    const activeProjects = useMemo(() => {
        const query = search.trim().toLowerCase();

        return projects
            .filter((project: Project) => !project.archived)
            .filter((project: Project) => {
                if (!query) return true;

                // Every field is optional in the payload — a missing description
                // used to throw here and take the whole page down.
                return [project.name, project.key, project.description]
                    .filter(Boolean)
                    .some((field) =>
                        String(field).toLowerCase().includes(query)
                    );
            })
            .sort((a: Project, b: Project) => {
                if (sort === "name-desc") {
                    return b.name.localeCompare(a.name, undefined, {
                        sensitivity: "base",
                    });
                }

                if (sort === "key") {
                    return a.key.localeCompare(b.key, undefined, {
                        sensitivity: "base",
                    });
                }

                return a.name.localeCompare(b.name, undefined, {
                    sensitivity: "base",
                });
            });
    }, [projects, search, sort]);

    const archivedProjects = projects.filter((project: Project) => project.archived);
    const hasSearch = search.trim().length > 0;

    const clearFilters = () => {
        setSearch("");
    };

    const openCreate = () => {
        if (!isAdmin) return;
        setOpen(true);
    };

    return (
        <AppLayout>
            <div className="space-y-5">
                <PageHeader
                    eyebrow="Workspace"
                    title="Projects"
                    description={
                        isLoading
                            ? "Loading your projects…"
                            : `${formatNumber(projects.length)} project${projects.length === 1 ? "" : "s"} in this workspace`
                    }
                    actions={
                        isAdmin ? (
                            <>
                                {archivedProjects.length > 0 && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setArchivedOpen(true)}
                                        className="w-full sm:w-auto"
                                    >
                                        <Archive />
                                        Archived ({archivedProjects.length})
                                    </Button>
                                )}
                                <Button
                                    onClick={openCreate}
                                    className="w-full sm:w-auto"
                                >
                                    New Project
                                </Button>
                            </>
                        ) : undefined
                    }
                    toolbar={
                        <ProjectToolbar
                            search={search}
                            onSearch={setSearch}
                            sort={sort}
                            onSort={setSort}
                        />
                    }
                />

                {error ? (
                    <ErrorState
                        error={error}
                        title="We couldn't load your projects"
                        action={
                            <Button
                                variant="outline"
                                onClick={() => void refetch()}
                            >
                                Try again
                            </Button>
                        }
                    />
                ) : (
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold text-foreground">
                            Active projects
                        </h2>
                        <ProjectTable
                            data={activeProjects}
                            isLoading={isLoading}
                            filtered={hasSearch}
                            onCreate={isAdmin ? openCreate : undefined}
                            query={search}
                            onClearFilter={clearFilters}
                            emptyTitle={isAdmin ? "No active projects" : undefined}
                            emptyDescription={isAdmin ? "Create a project or restore one from Archived." : undefined}
                        />
                    </section>
                )}

                {isAdmin && (
                    <>
                        <ArchivedProjectsDialog
                            open={archivedOpen}
                            onOpenChange={setArchivedOpen}
                            projects={archivedProjects}
                        />
                        <ProjectFormDialog
                            open={open}
                            onOpenChange={(value) => {
                                if (value && !isAdmin) return;
                                setOpen(value);
                            }}
                        />
                    </>
                )}
            </div>
        </AppLayout>
    );
}

type ArchivedProjectsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projects: Project[];
};

function ArchivedProjectsDialog({
    open,
    onOpenChange,
    projects,
}: ArchivedProjectsDialogProps) {
    const restore = useRestoreProject();

    const handleRestore = async (project: Project) => {
        if (restore.isPending) return;

        try {
            await restore.mutateAsync(project.id);
            toast.success("Project restored.");
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: "Couldn't restore that project",
            });
            toast.error(title, { description });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Archived projects</DialogTitle>
                    <DialogDescription>
                        Restore a project to return it to the active list.
                    </DialogDescription>
                </DialogHeader>

                <DialogBody>
                    {projects.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            No archived projects.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {projects.map((project) => (
                                <li
                                    key={project.id}
                                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                                >
                                    <ProjectMark
                                        color={project.color}
                                        icon={project.icon}
                                        keyName={project.key}
                                        size="sm"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {project.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {project.key}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => void handleRestore(project)}
                                        disabled={restore.isPending}
                                        aria-label={`Restore ${project.name}`}
                                    >
                                        {restore.isPending && restore.variables === project.id ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <ArchiveRestore />
                                        )}
                                        Restore
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </DialogBody>

                <DialogFooter showCloseButton />
            </DialogContent>
        </Dialog>
    );
}