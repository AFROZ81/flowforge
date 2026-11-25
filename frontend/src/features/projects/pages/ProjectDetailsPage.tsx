import { useParams } from "react-router";

import DetailLayout from "@/layouts/DetailLayout";
import { ErrorStateBlock } from "@/components/ui/error-state";
import { SkeletonPanel, SkeletonStatCard } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { useProject } from "../hooks/useProject";

import ProjectHeader from "../components/ProjectHeader";
import ProjectStats from "../components/ProjectStats";

import BoardGrid from "@/features/boards/components/BoardGrid";
import RecentActivity from "../components/RecentActivity";

export default function ProjectDetailsPage() {
    const { id } = useParams();

    const {
        data: project,
        isLoading,
        isError,
        error,
        refetch,
    } = useProject(id!);

    /* ---------- LOADING ---------- */
    if (isLoading) {
        return (
            <DetailLayout>
                <div className="space-y-5" aria-busy="true">
                    <SkeletonPanel height="h-16" />

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <SkeletonStatCard key={index} />
                        ))}
                    </div>

                    <SkeletonPanel height="h-40" />
                </div>
            </DetailLayout>
        );
    }

    /* ---------- NOT FOUND / ERROR ---------- */
    if (isError || !project) {
        return (
            <DetailLayout>
                <ErrorStateBlock
                    error={error}
                    title="We can't open this project"
                    description="It may have been deleted, or you may not have access to it."
                    action={
                        <Button
                            variant="outline"
                            onClick={() => void refetch()}
                        >
                            Try again
                        </Button>
                    }
                />
            </DetailLayout>
        );
    }

    return (
        <DetailLayout>
            <div className="space-y-6 lg:space-y-8">

                {/* =================================================
                    HEADER
                ================================================= */}
                <ProjectHeader project={project} />


                {/* =================================================
                    LIVE PROJECT STATS
                ================================================= */}
                <ProjectStats projectId={project.id} />


                {/* =================================================
                    BOARDS
                ================================================= */}
                <BoardGrid projectId={project.id} />


                {/* =================================================
                    RECENT ACTIVITY
                ================================================= */}
                <RecentActivity projectId={project.id} />
            </div>
        </DetailLayout>
    );
}
