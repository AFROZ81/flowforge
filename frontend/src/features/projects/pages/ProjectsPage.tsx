import AppLayout from "@/layouts/AppLayout";

import ProjectTable from "../components/ProjectTable";
import { useProjects } from "../hooks/useProjects";

export default function ProjectsPage() {

    const {
        data,
        isLoading,
        error,
    } = useProjects();

    return (
        <AppLayout>

            <div className="space-y-6">

                <div className="flex items-center justify-between">

                    <div>

                        <h1 className="text-4xl font-bold">
                            Projects
                        </h1>

                        <p className="text-slate-500">
                            Manage all projects.
                        </p>

                    </div>

                </div>

                {isLoading && (
                    <p>Loading...</p>
                )}

                {error && (
                    <p>Failed to load.</p>
                )}

                {data && (
                    <ProjectTable
                        data={data.data.items}
                    />
                )}

            </div>

        </AppLayout>
    );
}