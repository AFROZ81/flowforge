import { Link } from "react-router";
import { FolderKanban } from "lucide-react";

import { ProjectMark } from "@/components/common/project-mark";
import { cn } from "@/lib/utils";
import ProjectStatusBadge from "./ProjectStatusBadge";
import ProjectActions from "./ProjectActions";

import type { Project } from "../types/project";

type Props = {
    project: Project;
};

/**
 * A project card for the responsive grid.
 *
 * The whole surface is one tap target — the link's ::after covers the card —
 * while the actions menu sits above it, so edit and archive work here too
 * instead of being a desktop-only affordance.
 */
export default function ProjectCard({ project }: Props) {
    const hasDescription = Boolean(project.description?.trim());

    return (
        <article
            className={cn(
                "group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs",
                "transition-[border-color,box-shadow,transform] duration-(--transition-fast)",
                "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm",
                "focus-within:border-border-strong"
            )}
        >
            <Link
                to={`/projects/${project.id}`}
                className="
                    flex min-w-0 flex-1 flex-col gap-3 rounded-lg
                    outline-none after:absolute after:inset-0 after:content-['']
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
                "
            >
                <div className="flex items-start gap-3">
                    <ProjectMark
                        color={project.color}
                        icon={project.icon}
                        keyName={project.key}
                        size="md"
                    />

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                            <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                                {project.name}
                            </h3>
                        </div>
                        <p className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.04em] text-muted-foreground/80 uppercase tabular-nums">
                            <FolderKanban
                                className="size-3 text-muted-foreground/60"
                                aria-hidden="true"
                            />
                            {project.key}
                        </p>
                    </div>
                </div>

                <p
                    className={cn(
                        "line-clamp-2 text-xs leading-relaxed",
                        hasDescription
                            ? "text-muted-foreground"
                            : "text-muted-foreground/50 italic"
                    )}
                >
                    {hasDescription
                        ? project.description
                        : "No description"}
                </p>
            </Link>

            <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                <ProjectStatusBadge archived={project.archived} />

                {/* Lifted above the stretched link so the menu still receives clicks. */}
                <span className="relative z-10 shrink-0">
                    <ProjectActions project={project} />
                </span>
            </div>
        </article>
    );
}