import { FolderKanban, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyStateCard } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

import ProjectCard from "./ProjectCard";

import type { Project } from "../types/project";

type Props = {
    data: Project[];
    isLoading: boolean;
    /** Distinguishes "no projects" from "nothing matched the search". */
    filtered?: boolean;
    onCreate?: () => void;
    /** Active search query, echoed in the filtered empty state. */
    query?: string;
    /** Clear the active filter from the empty state. */
    onClearFilter?: () => void;
    emptyTitle?: string;
    emptyDescription?: string;
};

export default function ProjectTable({
    data,
    isLoading,
    filtered = false,
    onCreate,
    query,
    onClearFilter,
    emptyTitle = "No projects yet",
    emptyDescription = "Create your first project to start organizing your team's work.",
}: Props) {
    if (isLoading) {
        return <ProjectGridSkeleton />;
    }

    if (data.length === 0) {
        if (filtered) {
            return (
                <EmptyStateCard
                    icon={Search}
                    title="No projects match that search"
                    description={
                        query
                            ? `Nothing matches “${query.trim()}”. Try a different name or project key.`
                            : "Try a different name or project key."
                    }
                    action={
                        onClearFilter ? (
                            <Button variant="outline" onClick={onClearFilter}>
                                Clear search
                            </Button>
                        ) : undefined
                    }
                />
            );
        }

        return (
            <EmptyStateCard
                icon={FolderKanban}
                tone="brand"
                title={emptyTitle}
                description={emptyDescription}
                action={
                    onCreate ? (
                        <Button onClick={onCreate}>
                            <Plus />
                            Create project
                        </Button>
                    ) : undefined
                }
            />
        );
    }

    return (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.map((project) => (
                <li key={project.id}>
                    <ProjectCard project={project} />
                </li>
            ))}
        </ul>
    );
}

function ProjectGridSkeleton() {
    return (
        <ul
            aria-hidden="true"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
            {Array.from({ length: 6 }).map((_, index) => (
                <li
                    key={index}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs"
                >
                    <div className="flex items-start gap-3">
                        <Skeleton className="size-9 rounded-lg" />
                        <div className="min-w-0 flex-1 space-y-2">
                            <Skeleton className="h-3.5 w-2/3" />
                            <Skeleton className="h-3 w-1/3 opacity-70" />
                        </div>
                    </div>
                    <Skeleton className="h-3 w-full opacity-70" />
                    <div className="flex items-center justify-between pt-1">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="size-8 rounded-lg" />
                    </div>
                </li>
            ))}
        </ul>
    );
}