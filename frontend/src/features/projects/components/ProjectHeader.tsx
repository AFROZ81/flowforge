import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Archive, ArrowLeft, Loader2, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectMark } from "@/components/common/project-mark";
import ProjectFormDialog from "./ProjectFormDialog";
import ProjectStatusBadge from "./ProjectStatusBadge";

import { useArchiveProjectWithUndo } from "../hooks/useArchiveProjectWithUndo";

import type { Project } from "../types/project";

type Props = {
    project: Project;
};

export default function ProjectHeader({ project }: Props) {
    const [editing, setEditing] = useState(false);
    const { archiveWithUndo, isPending } = useArchiveProjectWithUndo();
    const navigate = useNavigate();

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

                        {project.description && (
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                {project.description}
                            </p>
                        )}
                    </div>
                </div>

                {/*
                 * Archiving leaves the detail page: the project no longer comes
                 * back in the list, so staying would strand the reader on a page
                 * about something that just disappeared. Undo puts it back.
                 */}
                <div className="flex shrink-0 gap-2 [&>*]:grow sm:[&>*]:grow-0">
                    <Button
                        variant="outline"
                        onClick={() => setEditing(true)}
                        disabled={isPending}
                    >
                        <Pencil />
                        Edit
                    </Button>

                    <Button
                        variant="outline"
                        disabled={isPending}
                        onClick={() =>
                            archiveWithUndo(project, () =>
                                navigate("/projects", { replace: true })
                            )
                        }
                    >
                        {isPending ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <Archive />
                        )}
                        {isPending ? "Archiving…" : "Archive"}
                    </Button>
                </div>
            </div>

            <ProjectFormDialog
                open={editing}
                onOpenChange={setEditing}
                project={project}
            />
        </header>
    );
}
