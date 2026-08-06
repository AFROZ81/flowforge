import { useParams } from "react-router";

import { Card } from "@/components/ui/card";

import { useProject } from "../hooks/useProject";

import ProjectHeader from "../components/ProjectHeader";
import ProjectStats from "../components/ProjectStats";
import RecentBoards from "../components/RecentBoards";
import RecentActivity from "../components/RecentActivity";

export default function ProjectDetailsPage() {
    const { id } = useParams();

    const {
        data: project,
        isLoading,
        isError,
    } = useProject(id!);

    if (isLoading) {
        return (
            <div className="p-6">
                Loading...
            </div>
        );
    }

    if (isError || !project) {
        return (
            <div className="p-6">
                Project not found.
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">

            <div className="space-y-8">

                <ProjectHeader
                    project={project}
                />

                <ProjectStats />

                <div className="grid gap-6 xl:grid-cols-2">

                    <RecentBoards />

                    <RecentActivity />

                </div>

            </div>

            <Card className="p-6 space-y-4">

                <div>

                    <h2 className="font-semibold">
                        Description
                    </h2>

                    <p className="text-muted-foreground">
                        {project.description || "No description"}
                    </p>

                </div>

                <div className="grid grid-cols-2 gap-6">

                    <div>

                        <p className="text-sm text-muted-foreground">
                            Status
                        </p>

                        <p className="font-medium">
                            {project.archived ? "Archived" : "Active"}
                        </p>

                    </div>

                    <div>

                        <p className="text-sm text-muted-foreground">
                            Color
                        </p>

                        <div
                            className="mt-2 h-6 w-6 rounded-full border"
                            style={{
                                backgroundColor: project.color,
                            }}
                        />

                    </div>

                </div>

            </Card>

        </div>
    );
}