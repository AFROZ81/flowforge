import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

import { ProjectMark } from "@/components/common/project-mark";
import ProjectStatusBadge from "./ProjectStatusBadge";

import type { Project } from "../types/project";

type Props = {
    project: Project;
};

/**
 * The mobile representation of a project row.
 *
 * A phone gets one tappable card per project carrying the three things that
 * actually identify it — mark, name, key — instead of a six-column table
 * scrolled sideways off the edge of the screen.
 */
export default function ProjectCard({ project }: Props) {
    return (
        <Link
            to={`/projects/${project.id}`}
            className="
                group flex items-center gap-3 rounded-xl border border-border bg-card p-3
                shadow-xs transition-[border-color,box-shadow,transform] duration-(--transition-normal)
                ease-(--ease-standard) hover:border-border-strong hover:shadow-sm
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
            "
        >
            <ProjectMark
                color={project.color}
                icon={project.icon}
                keyName={project.key}
                size="md"
            />

            <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                        {project.name}
                    </span>
                    <ProjectStatusBadge archived={project.archived} />
                </span>

                <span className="mt-0.5 flex items-center gap-2">
                    <span className="shrink-0 rounded-md bg-surface-sunken px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.04em] text-muted-foreground uppercase tabular-nums">
                        {project.key}
                    </span>

                    {project.description && (
                        <span className="min-w-0 truncate text-xs text-muted-foreground">
                            {project.description}
                        </span>
                    )}
                </span>
            </span>

            <ChevronRight
                className="size-4 shrink-0 text-muted-foreground/50 transition-transform duration-(--transition-fast) group-hover:translate-x-0.5"
                aria-hidden="true"
            />
        </Link>
    );
}
