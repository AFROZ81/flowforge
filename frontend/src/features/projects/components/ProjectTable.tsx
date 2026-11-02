import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { FolderKanban } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonTable } from "@/components/ui/skeleton";

import { columns } from "./ProjectColumns";
import ProjectCard from "./ProjectCard";

import type { Project } from "../types/project";

/** Column meta → the classes actually applied to a cell. */
function cellClass(meta?: { className?: string; align?: string }) {
    const align =
        meta?.align === "right"
            ? "text-right"
            : meta?.align === "center"
              ? "text-center"
              : undefined;

    return [meta?.className, align].filter(Boolean).join(" ") || undefined;
}

type Props = {
    data: Project[];
    isLoading: boolean;
    /** Distinguishes "no projects" from "nothing matched the search". */
    filtered?: boolean;
    onCreate?: () => void;
};

export default function ProjectTable({
    data,
    isLoading,
    filtered = false,
    onCreate,
}: Props) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const rows = table.getRowModel().rows;

    if (isLoading) {
        return <SkeletonTable rows={5} cols={4} />;
    }

    if (rows.length === 0) {
        return filtered ? (
            <div className="rounded-xl border border-border bg-card shadow-xs">
                <EmptyState
                    icon={FolderKanban}
                    title="No projects match that search"
                    description="Try a different name or project key."
                    size="sm"
                    className="py-10"
                />
            </div>
        ) : (
            <div className="rounded-xl border border-border bg-card shadow-xs">
                <EmptyState
                    icon={FolderKanban}
                    title="No projects yet"
                    description="Create your first project to start organizing your team's work."
                    action={onCreate && (
                        <Button type="button" onClick={onCreate}>
                            Create Project
                        </Button>
                    )}
                    className="py-12"
                />
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">

            {/* ---------- Desktop / tablet: full table ---------- */}
            <Table
                stickyHeader
                className="min-w-[640px]"
                containerClassName="hidden sm:block"
            >
                <TableHeader>
                    {table.getHeaderGroups().map((group) => (
                        <TableRow
                            key={group.id}
                            className="hover:bg-transparent"
                        >
                            {group.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className={cellClass(header.column.columnDef.meta)}
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>

                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell
                                    key={cell.id}
                                    className={cellClass(cell.column.columnDef.meta)}
                                >
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* ---------- Phone: cards, not a sideways table ---------- */}
            <ul className="grid gap-2 p-3 sm:hidden">
                {data.map((project) => (
                    <li key={project.id}>
                        <ProjectCard project={project} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
