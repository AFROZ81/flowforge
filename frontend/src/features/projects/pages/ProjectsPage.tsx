import { useMemo, useState } from "react";

import AppLayout from "@/layouts/AppLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";

import { useProjects } from "../hooks/useProjects";

import ProjectTable from "../components/ProjectTable";
import ProjectToolbar from "../components/ProjectToolbar";
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
    const [open, setOpen] = useState(false);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return projects;

        // Every field is optional in the payload — a missing description
        // used to throw here and take the whole page down.
        return projects.filter((project: Project) =>
            [project.name, project.key, project.description]
                .filter(Boolean)
                .some((field) => String(field).toLowerCase().includes(query))
        );
    }, [projects, search]);

    const isFiltering = search.trim().length > 0;

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
                        <Button
                            onClick={() => setOpen(true)}
                            className="w-full sm:w-auto"
                        >
                            New Project
                        </Button>
                    }
                    toolbar={
                        <ProjectToolbar search={search} onSearch={setSearch} />
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
                    <ProjectTable
                        data={filtered}
                        isLoading={isLoading}
                        filtered={isFiltering}
                        onCreate={() => setOpen(true)}
                    />
                )}

                <ProjectFormDialog
                    open={open}
                    onOpenChange={setOpen}
                />
            </div>
        </AppLayout>
    );
}
