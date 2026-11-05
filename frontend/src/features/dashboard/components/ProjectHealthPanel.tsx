import { Link } from "react-router";
import { FolderKanban } from "lucide-react";

import { formatNumber, formatPercentage } from "@/lib/format";
import { ProjectMark } from "@/components/common/project-mark";
import DataSection from "@/components/ui/data-section";
import EmptyStatePanel from "./EmptyStatePanel";
import SegmentBar from "@/components/ui/segment-bar";

import type { ProjectHealth } from "../types/dashboard.types";

type Props = {
    projects: ProjectHealth[];
    /** All projects in the workspace, including any outside this slice. */
    projectCount: number;
};

/**
 * The same three states the status mix counts, drawn per project.
 *
 * This used to be four numeric columns and a completion meter. The meter could
 * tell you a project was 60% done but not whether the other 40% was ordinary
 * work or something stuck, and comparing "Items: 42" against "Items: 38"
 * across rows is slower than looking at two bar lengths - which is the one
 * thing a table cannot do.
 *
 * So each bar carries two proportions at once: its *length* is the project's
 * size against the largest project in the set, and its *segments* are what that
 * size is made of. The scale is stated in the legend because it is an
 * comparison the reader is entitled to know about - the track is not each
 * project's own 100%.
 *
 * Ordered by overdue count rather than by name, unchanged from the table,
 * because the question this section answers is "which project needs me".
 */
export default function ProjectHealthPanel({
    projects,
    projectCount,
}: Props) {
    const totals = projects.reduce(
        (accumulator, project) => ({
            total: accumulator.total + project.total,
            completed: accumulator.completed + project.completed,
            blocked: accumulator.blocked + project.blocked,
            overdue: accumulator.overdue + project.overdue,
        }),
        { total: 0, completed: 0, blocked: 0, overdue: 0 }
    );

    /* Every bar is measured against the same number, or the lengths say nothing. */
    const largest = Math.max(
        1,
        ...projects.map((project) => project.total)
    );

    const segmentsOf = (project: ProjectHealth) => [
        {
            label: "Completed",
            value: project.completed,
            className: "bg-success",
        },
        {
            label: "Active",
            /* Status is exactly one of the three, so what is neither done nor
               stuck is in progress. Derived rather than sent because the
               snapshot has no reason to carry the arithmetic twice. */
            value: Math.max(0, project.total - project.completed - project.blocked),
            className: "bg-primary",
        },
        {
            label: "Blocked",
            value: project.blocked,
            className: "bg-destructive",
        },
    ];

    return (
        <DataSection
            title="Project health"
            icon={FolderKanban}
            note={
                projects.length === 0
                    ? undefined
                    : projectCount > projects.length
                      ? `Highest-risk ${formatNumber(projects.length)} of ${formatNumber(projectCount)}`
                      : `All ${formatNumber(projects.length)} projects`
            }
        >
            {projects.length === 0 ? (
                <EmptyStatePanel
                    title="No projects yet"
                    description="Projects appear here as soon as your team creates them."
                />
            ) : (
                <>
                    {/* Stated once for the whole column, which is what turns the
                        bars from decoration into a chart. Overdue is not a
                        segment: a past-due item is also active or blocked, so it
                        would be counted twice - it stays a number on its row. */}
                    <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1.5 border-b px-4 py-2.5 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <span
                                aria-hidden="true"
                                className="size-2 shrink-0 rounded-full bg-success"
                            />
                            Completed
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span
                                aria-hidden="true"
                                className="size-2 shrink-0 rounded-full bg-primary"
                            />
                            Active
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span
                                aria-hidden="true"
                                className="size-2 shrink-0 rounded-full bg-destructive"
                            />
                            Blocked
                        </span>
                        <span className="ml-auto">
                            length against {formatNumber(largest)}, the largest
                        </span>
                    </div>

                    {/* The rows scroll between a legend that stays on top and a
                        summary that stays at the bottom, because the two things
                        a reader comes back to should not move. */}
                    <ul className="max-h-[26rem] min-h-[12rem] flex-1 divide-y divide-border overflow-y-auto xl:max-h-none">
                        {projects.map((project) => (
                            <li
                                key={project.projectId}
                                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 px-4 py-3 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_3.75rem]"
                            >
                                <Link
                                    to={`/projects/${project.projectId}`}
                                    className="group col-span-2 flex min-w-0 items-center gap-2.5 rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:col-span-1"
                                >
                                    {/* The same mark the project list uses, so a
                                        project is recognisable across the app. */}
                                    <ProjectMark
                                        color={project.color}
                                        icon={project.icon}
                                        keyName={project.projectKey}
                                        size="sm"
                                    />
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-medium group-hover:underline">
                                            {project.projectName}
                                        </span>
                                        <span className="block font-mono text-[10px] tracking-[0.05em] text-muted-foreground uppercase">
                                            {project.projectKey}
                                        </span>
                                    </span>
                                </Link>

                                <div className="min-w-0">
                                    <SegmentBar
                                        segments={segmentsOf(project)}
                                        total={largest}
                                    />

                                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 text-[11px] tabular-nums text-muted-foreground">
                                        <span>
                                            {formatNumber(project.total)} items
                                        </span>

                                        {project.overdue > 0 ? (
                                            <span className="font-medium text-destructive">
                                                {formatNumber(project.overdue)}{" "}
                                                past due
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="text-right">
                                    {/* Whole percents. This figure is a chart
                                        label, not a measurement to reconcile -
                                        the counts themselves are on the row and
                                        in the summary below. */}
                                    <span className="text-sm leading-none font-semibold tabular-nums">
                                        {formatPercentage(
                                            Math.round(
                                                project.completionPercentage
                                            )
                                        )}
                                    </span>
                                    <span className="mt-1 block text-[10px] leading-none text-muted-foreground">
                                        done
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="
                        flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t
                        bg-surface-muted/60 px-4 py-2.5 text-xs tabular-nums text-muted-foreground
                    ">
                        <span className="font-medium text-foreground">
                            {formatNumber(projects.length)} projects
                        </span>
                        <span>{formatNumber(totals.total)} items</span>
                        <span>{formatNumber(totals.completed)} done</span>

                        {totals.blocked > 0 ? (
                            <span className="text-destructive">
                                {formatNumber(totals.blocked)} blocked
                            </span>
                        ) : null}

                        {totals.overdue > 0 ? (
                            <span className="text-destructive">
                                {formatNumber(totals.overdue)} past due
                            </span>
                        ) : null}

                        {totals.total > 0 ? (
                            <span className="ml-auto font-medium text-foreground">
                                {formatPercentage(
                                    Math.round(
                                        (totals.completed / totals.total) * 100
                                    )
                                )}{" "}
                                done overall
                            </span>
                        ) : null}
                    </div>
                </>
            )}
        </DataSection>
    );
}
