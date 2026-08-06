import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { columns } from "./ProjectColumns";

import type { Project } from "../types/project";

type Props = {
    data: Project[];
    isLoading: boolean;
};

export default function ProjectTable({
    data,
}: Props) {

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="rounded-2xl border bg-white">

            <Table>

                <TableHeader>

                    {table
                        .getHeaderGroups()
                        .map((group) => (
                            <TableRow key={group.id}>

                                {group.headers.map(
                                    (header) => (
                                        <TableHead
                                            key={header.id}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header
                                                          .column
                                                          .columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    )
                                )}

                            </TableRow>
                        ))}

                </TableHeader>

                <TableBody>

                    {table
                        .getRowModel()
                        .rows
                        .map((row) => (
                            <TableRow key={row.id}>

                                {row
                                    .getVisibleCells()
                                    .map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                        >
                                            {flexRender(
                                                cell.column
                                                    .columnDef
                                                    .cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}

                            </TableRow>
                        ))}

                </TableBody>

            </Table>

        </div>
    );
}