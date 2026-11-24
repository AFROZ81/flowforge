import { ArrowDownWideNarrow, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ProjectStatusFilter = "all" | "active" | "archived";

export type ProjectSortMode = "name-asc" | "name-desc" | "key";

type Props = {
    search: string;
    onSearch: (value: string) => void;
    status: ProjectStatusFilter;
    onStatus: (value: ProjectStatusFilter) => void;
    sort: ProjectSortMode;
    onSort: (value: ProjectSortMode) => void;
};

const SORT_LABELS: Record<ProjectSortMode, string> = {
    "name-asc": "Name, A–Z",
    "name-desc": "Name, Z–A",
    key: "Key, A–Z",
};

/**
 * Search, status filter and sort for the projects grid.
 *
 * The page's single "New Project" action lives in the PageHeader — having one
 * here too meant two identical buttons stacked on a phone and sitting side by
 * side on a desktop.
 */
export default function ProjectToolbar({
    search,
    onSearch,
    status,
    onStatus,
    sort,
    onSort,
}: Props) {
    return (
        <div className="flex w-full flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:flex-none">
                <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                />

                <label htmlFor="project-search" className="sr-only">
                    Search projects
                </label>

                <Input
                    id="project-search"
                    type="search"
                    value={search}
                    placeholder="Search projects"
                    onChange={(e) => onSearch(e.target.value)}
                    className="h-9 w-full rounded-lg pr-8 pl-9 sm:w-72"
                />

                {search && (
                    <button
                        type="button"
                        onClick={() => onSearch("")}
                        aria-label="Clear search"
                        className="
                            absolute top-1/2 right-2 grid size-5 -translate-y-1/2
                            place-items-center rounded-sm text-muted-foreground
                            transition-colors hover:text-foreground
                            focus-visible:ring-[3px] focus-visible:ring-ring/50
                        "
                    >
                        <X className="size-3.5" />
                    </button>
                )}
            </div>

            <label className="relative inline-flex items-center">
                <span className="sr-only">Filter by status</span>
                <span
                    aria-hidden="true"
                    className={cn(
                        "pointer-events-none absolute left-2.5 size-2.5 rounded-full",
                        status === "active" && "bg-success",
                        status === "archived" && "bg-border-strong",
                        status === "all" && "bg-muted-foreground/50"
                    )}
                />
                <select
                    value={status}
                    onChange={(event) =>
                        onStatus(event.target.value as ProjectStatusFilter)
                    }
                    className={cn(
                        "h-9 cursor-pointer appearance-none rounded-lg border border-input bg-card pr-8 pl-8 text-[13px] font-medium text-foreground",
                        "outline-none transition-colors hover:border-border-strong",
                        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35"
                    )}
                >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                </select>
            </label>

            <label className="relative inline-flex items-center">
                <span className="sr-only">Sort projects</span>
                <ArrowDownWideNarrow
                    aria-hidden="true"
                    className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground"
                />
                <select
                    value={sort}
                    onChange={(event) =>
                        onSort(event.target.value as ProjectSortMode)
                    }
                    className={cn(
                        "h-9 cursor-pointer appearance-none rounded-lg border border-input bg-card pr-8 pl-8 text-[13px] font-medium text-foreground",
                        "outline-none transition-colors hover:border-border-strong",
                        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35"
                    )}
                >
                    {(Object.keys(SORT_LABELS) as ProjectSortMode[]).map(
                        (mode) => (
                            <option key={mode} value={mode}>
                                {SORT_LABELS[mode]}
                            </option>
                        )
                    )}
                </select>
            </label>
        </div>
    );
}