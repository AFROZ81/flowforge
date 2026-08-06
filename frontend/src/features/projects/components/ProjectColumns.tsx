import type { ColumnDef } from "@tanstack/react-table";

import ProjectActions from "./ProjectActions";
import ProjectIcon from "./ProjectIcon";
import ProjectStatusBadge from "./ProjectStatusBadge";

import type { Project } from "../types/project";

import { Link } from "react-router";

export const columns: ColumnDef<Project>[] = [
    {
        accessorKey: "icon",
        header: "",
        cell: ({ row }) => (
            <ProjectIcon
                icon={row.original.icon}
                color={row.original.color}
            />
        ),
    },
    {
        accessorKey: "key",
        header: "Key",
    },
    {
    accessorKey: "name",
        header: "Project",
        cell: ({ row }) => (
            <Link
                to={`/projects/${row.original.id}`}
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
                {row.original.name}
            </Link>
        ),
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
            <ProjectStatusBadge
                archived={row.original.archived}
            />
        ),
    },
    {
        id: "actions",
        header: "",
        cell: () => <ProjectActions />,
    },
];