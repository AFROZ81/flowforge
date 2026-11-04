import { Link } from "react-router";
import { History } from "lucide-react";

import { formatRelativeTime } from "@/lib/format";
import { StatusDot } from "@/components/common/indicators";
import DataSection from "@/components/ui/data-section";
import EmptyStatePanel from "./EmptyStatePanel";

import type { WorkItemBrief } from "../types/dashboard.types";

/**
 * Movement across the whole workspace, not just your own queue.
 *
 * A list rather than a table: each row is read as a sentence, and the four
 * columns a table would force are noise at eight rows.
 */
export default function RecentlyUpdated({
    items,
}: {
    items: WorkItemBrief[];
}) {
    return (
        <DataSection
            title="Recently updated"
            icon={History}
            note={items.length > 0 ? "Across the workspace" : undefined}
        >
            {items.length === 0 ? (
                <EmptyStatePanel
                    icon={History}
                    title="Nothing has changed yet"
                    description="Work items appear here as soon as anybody touches them."
                />
            ) : (
                <ul className="divide-y divide-border">
                    {items.map((item) => (
                        <li key={item.id}>
                            <Link
                                to={`/projects/${item.projectId}/boards/${item.boardId}`}
                                title={item.title}
                                className="
                                    group flex items-center gap-4 px-4 py-3
                                    outline-none transition-colors hover:bg-surface-muted
                                    focus-visible:ring-[3px] focus-visible:ring-ring/40
                                "
                            >
                                <StatusDot
                                    status={item.status}
                                    className="shrink-0"
                                />

                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium group-hover:underline">
                                        {item.title}
                                    </span>
                                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                        {item.projectName}
                                        {" · "}
                                        {item.boardName}
                                    </span>
                                </span>

                                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                                    {formatRelativeTime(item.lastActivityAt)}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </DataSection>
    );
}
