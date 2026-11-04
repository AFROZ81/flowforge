import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";

import { ProjectMark } from "@/components/common/project-mark";
import ProjectStatusBadge from "./ProjectStatusBadge";
import ProjectActions from "./ProjectActions";

import type { Project } from "../types/project";

/**
 * Desktop column definitions.
 *
 * `key` and `name` were two separate columns showing near-identical text;
 * they're now one identity cell, which frees the width the description
 * column always wanted.
 */
export const columns: ColumnDef<Project>[] = [
    {
        id: "project",
        header: "Project",
        accessorFn: (row) => row.name,
        cell: ({ row }) => (
            <Link
                to={`/projects/${row.original.id}`}
                className="
                    group flex min-w-0 items-center gap-3 rounded-md -outline-offset-2
                    focus-visible:outline-2 focus-visible:outline-ring
                "
            >
                <ProjectMark
                    color={row.original.color}
                    icon={row.original.icon}
                    keyName={row.original.key}
                    size="sm"
                />

                <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground group-hover:text-primary group-hover:underline group-hover:decoration-primary/40 group-hover:underline-offset-2">
                        {row.original.name}
                    </span>

                    <span className="block text-[11px] tracking-[0.04em] text-muted-foreground/80 uppercase tabular-nums">
                        {row.original.key}
                    </span>
                </span>
            </Link>
        ),
        meta: { className: "min-w-[220px]" },
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ getValue }) => {
            const description = getValue<string>();

            return description?.trim() ? (
                <span
                    className="block max-w-[420px] truncate text-sm text-muted-foreground"
                    title={description}
                >
                    {description}
                </span>
            ) : (
                <span className="text-sm text-muted-foreground/60 italic">
                    No description
                </span>
            );
        },
    },
    {
        id: "status",
        header: "Status",
        accessorFn: (row) => (row.archived ? "Archived" : "Active"),
        cell: ({ row }) => (
            <ProjectStatusBadge archived={row.original.archived} />
        ),
        meta: { className: "w-[1%]" },
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => <ProjectActions project={row.original} />,
        meta: { align: "right", className: "w-[1%]" },
    },
];
