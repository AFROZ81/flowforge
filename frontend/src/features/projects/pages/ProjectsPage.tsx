import { useMemo, useState } from "react";

import AppLayout from "@/layouts/AppLayout";

import { useProjects } from "../hooks/useProjects";

import ProjectTable from "../components/ProjectTable";
import ProjectToolbar from "../components/ProjectToolbar";
import CreateProjectDialog from "../components/CreateProjectDialog";

export default function ProjectsPage() {
    const {
        data: projects = [],
        isLoading,
    } = useProjects();

    const [search, setSearch] = useState("");

    const [open, setOpen] = useState(false);

    const filtered = useMemo(() => {

        if (!search.trim())
            return projects;

        const q = search.toLowerCase();

        return projects.filter(
            (p: any) =>
                p.name.toLowerCase().includes(q) ||
                p.key.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q)
        );

    }, [projects, search]);

    if (isLoading) {
        return (
            <div className="rounded-xl border p-8 text-center text-slate-500">
                Loading projects...
            </div>
        );
    }

    return (
        <AppLayout>

            <h1 className="text-4xl font-bold">
                Projects
            </h1>

            <p className="mb-6 text-slate-500">
                Manage all projects.
            </p>

            <ProjectToolbar
                search={search}
                onSearch={setSearch}
                onCreate={() => setOpen(true)}
            />

            <ProjectTable
                data={filtered}
                isLoading={isLoading}
            />

            <CreateProjectDialog
                open={open}
                onOpenChange={setOpen}
            />
        </AppLayout>
    );
}