import type { ColumnDef } from "@tanstack/react-table";

import type { Project } from "../types/project";

export const columns: ColumnDef<Project>[] = [
    {
        accessorKey: "icon",
        header: "",
    },
    {
        accessorKey: "key",
        header: "Key",
    },
    {
        accessorKey: "name",
        header: "Project",
    },
    {
        accessorKey: "description",
        header: "Description",
    },
];