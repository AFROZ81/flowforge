import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProjectMark } from "@/components/common/project-mark";
import ProjectStatusBadge from "./ProjectStatusBadge";

import type { Project } from "../types/project";

type Props = {
    project: Project;
};

export default function ProjectHeader({ project }: Props) {
    return (
        <header className="space-y-4">
            <Link
                to="/projects"
                className="
                    inline-flex h-8 items-center gap-1.5 rounded-lg -mx-2 px-2
                    text-[13px] font-medium text-muted-foreground
                    transition-colors hover:bg-surface-muted hover:text-foreground
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
                "
            >
                <ArrowLeft className="size-4" aria-hidden="true" />
                All projects
            </Link>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3.5">
                    <ProjectMark
                        color={project.color}
                        icon={project.icon}
                        keyName={project.key}
                        size="lg"
                    />

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="min-w-0 font-heading text-xl leading-tight font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-2xl">
                                {project.name}
                            </h1>

                            <ProjectStatusBadge archived={project.archived} />

                            <Badge
                                variant="outline"
                                className="font-mono text-[11px] tracking-[0.06em] uppercase"
                            >
                                {project.key}
                            </Badge>
                        </div>

                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                            {project.description || (
                                <span className="italic">No description</span>
                            )}
                        </p>
                    </div>
                </div>

            </div>
        </header>
    );
}
