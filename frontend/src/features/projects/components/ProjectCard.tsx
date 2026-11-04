import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

import { ProjectMark } from "@/components/common/project-mark";
import ProjectStatusBadge from "./ProjectStatusBadge";
import ProjectActions from "./ProjectActions";

import type { Project } from "../types/project";

type Props = {
    project: Project;
};

/**
 * Mobile card.
 *
 * The whole surface is still one tap target — the link's ::after covers the
 * card — but the actions menu sits above it, so edit and archive work here too
 * instead of being a desktop-only affordance.
 */
export default function ProjectCard({ project }: Props) {
    return (
        <article
            className="
                relative flex items-center gap-2 rounded-xl border border-border bg-card p-3
                shadow-xs transition-[border-color,box-shadow] duration-(--transition-normal)
                ease-(--ease-standard) hover:border-border-strong hover:shadow-sm
            "
        >
            <Link
                to={`/projects/${project.id}`}
                className="
                    group flex min-w-0 flex-1 items-center gap-3 rounded-xl
                    outline-none after:absolute after:inset-0 after:content-['']
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

            {/* Lifted above the stretched link so the menu still receives clicks. */}
            <span className="relative z-10 shrink-0">
                <ProjectActions project={project} />
            </span>
        </article>
    );
}
