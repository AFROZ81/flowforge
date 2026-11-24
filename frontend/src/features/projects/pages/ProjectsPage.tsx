import { useMemo, useState } from "react";

import AppLayout from "@/layouts/AppLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";

import { useProjects } from "../hooks/useProjects";

import ProjectTable from "../components/ProjectTable";
import ProjectToolbar, {
    type ProjectSortMode,
    type ProjectStatusFilter,
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
    const [status, setStatus] = useState<ProjectStatusFilter>("all");
    const [sort, setSort] = useState<ProjectSortMode>("name-asc");
    const [open, setOpen] = useState(false);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        return projects
            .filter((project: Project) => {
                if (status === "active") return !project.archived;
                if (status === "archived") return Boolean(project.archived);
                return true;
            })
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
    }, [projects, search, status, sort]);

    const isFiltering =
        search.trim().length > 0 || status !== "all";

    const clearFilters = () => {
        setSearch("");
        setStatus("all");
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
                        <Button
                            onClick={() => setOpen(true)}
                            className="w-full sm:w-auto"
                        >
                            New Project
                        </Button>
                    }
                    toolbar={
                        <ProjectToolbar
                            search={search}
                            onSearch={setSearch}
                            status={status}
                            onStatus={setStatus}
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
                    <ProjectTable
                        data={filtered}
                        isLoading={isLoading}
                        filtered={isFiltering}
                        onCreate={() => setOpen(true)}
                        query={search}
                        onClearFilter={clearFilters}
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