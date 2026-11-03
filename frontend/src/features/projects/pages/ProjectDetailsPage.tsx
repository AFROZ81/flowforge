import { useParams } from "react-router";

import DetailLayout from "@/layouts/DetailLayout";
import { Card } from "@/components/ui/card";
import { ErrorStateBlock } from "@/components/ui/error-state";
import { SkeletonPanel, SkeletonStatCard } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ProjectMark } from "@/components/common/project-mark";
import { SectionHeader } from "@/components/ui/section-header";

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
                    ACTIVITY + DETAILS
                    Two columns on a wide screen, one on a phone.
                ================================================= */}
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">

                    <RecentActivity projectId={project.id} />

                    <Card className="h-fit gap-4 p-5 shadow-xs">
                        <SectionHeader
                            title="Project details"
                            description="As stored on the project."
                        />

                        <dl className="space-y-4 text-sm">
                            <div>
                                <dt className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                    Description
                                </dt>
                                <dd className="mt-1.5 leading-relaxed text-foreground/90">
                                    {project.description || (
                                        <span className="text-muted-foreground italic">
                                            No description
                                        </span>
                                    )}
                                </dd>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-border-subtle pt-4">
                                <div>
                                    <dt className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                        Status
                                    </dt>
                                    <dd className="mt-1 font-medium text-foreground">
                                        {project.archived
                                            ? "Archived"
                                            : "Active"}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                        Color
                                    </dt>
                                    <dd className="mt-1">
                                        <ProjectMark
                                            color={project.color}
                                            icon={project.icon}
                                            keyName={project.key}
                                            size="sm"
                                        />
                                    </dd>
                                </div>
                            </div>
                        </dl>
                    </Card>
                </div>
            </div>
        </DetailLayout>
    );
}
