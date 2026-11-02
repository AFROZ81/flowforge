import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";

type Props = {
    search: string;
    onSearch: (value: string) => void;
};

/**
 * Filtering only. The page's single "New Project" action lives in the
 * PageHeader — having one here too meant two identical buttons stacked on
 * a phone and sitting side by side on a desktop.
 */
export default function ProjectToolbar({ search, onSearch }: Props) {
    return (
        <div className="relative w-full sm:max-w-xs">
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
                placeholder="Search by name, key or description"
                onChange={(e) => onSearch(e.target.value)}
                className="pr-9 pl-9"
            />

            {search && (
                <button
                    type="button"
                    onClick={() => onSearch("")}
                    aria-label="Clear search"
                    className="
                        absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2
                        items-center justify-center rounded-md text-muted-foreground
                        transition-colors hover:bg-surface-sunken hover:text-foreground
                    "
                >
                    <X className="size-3.5" />
                </button>
            )}
        </div>
    );
}
