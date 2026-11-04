import { Link } from "react-router";
import { FolderKanban } from "lucide-react";

import { formatNumber } from "@/lib/format";
import { ProjectMark } from "@/components/common/project-mark";
import DataSection from "@/components/ui/data-section";
import EmptyStatePanel from "./EmptyStatePanel";
import Meter from "@/components/ui/meter";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import type { ProjectHealth } from "../types/dashboard.types";

type Props = {
    projects: ProjectHealth[];
    /** All projects in the workspace, including any outside this slice. */
    projectCount: number;
};

/**
 * Where delivery is actually going wrong.
 *
 * Ordered by overdue count rather than by name, because the question this
 * section answers is "which project needs me", and a project with nothing
 * behind it is not the answer.
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
                /* Proportions stated rather than measured from content, for
                   the same reason as the list above: an auto layout lets the
                   longest project name dictate the table's width and shove the
                   completion meter out of the card. */
                <Table className="w-full min-w-[40rem] table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[34%]">Project</TableHead>
                            <TableHead className="w-[11%] text-right">
                                Items
                            </TableHead>
                            <TableHead className="w-[12%] text-right">
                                Blocked
                            </TableHead>
                            <TableHead className="w-[12%] text-right">
                                Overdue
                            </TableHead>
                            <TableHead className="w-[31%]">
                                Completion
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map((project) => (
                            <TableRow key={project.projectId}>
                                <TableCell>
                                    <Link
                                        to={`/projects/${project.projectId}`}
                                        className="
                                            group flex min-w-0 items-center gap-2.5 rounded-sm
                                            outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40
                                        "
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
                                            <span className="block truncate font-medium group-hover:underline">
                                                {project.projectName}
                                            </span>
                                            <span className="block font-mono text-[10px] tracking-[0.05em] text-muted-foreground uppercase">
                                                {project.projectKey}
                                            </span>
                                        </span>
                                    </Link>
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {formatNumber(project.total)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {project.blocked > 0 ? (
                                        <span className="font-medium text-destructive">
                                            {formatNumber(project.blocked)}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground/60">
                                            0
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {project.overdue > 0 ? (
                                        <span className="font-medium text-destructive">
                                            {formatNumber(project.overdue)}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground/60">
                                            0
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Meter
                                        value={project.completed}
                                        total={project.total}
                                        tone="success"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell>
                                Total across {formatNumber(projects.length)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {formatNumber(totals.total)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {formatNumber(totals.blocked)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {formatNumber(totals.overdue)}
                            </TableCell>
                            <TableCell>
                                <Meter
                                    value={totals.completed}
                                    total={totals.total}
                                    tone="success"
                                />
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            )}
        </DataSection>
    );
}
