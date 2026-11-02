/* eslint-disable @typescript-eslint/no-unused-vars */
import type { RowData } from "@tanstack/react-table";

/**
 * Shared column metadata for every TanStack table in the app.
 *
 * `meta.className` lets a column definition carry its own width/alignment
 * rule, so table markup stays generic instead of each page hard-coding
 * cell classes at the render site.
 */
declare module "@tanstack/react-table" {
    interface ColumnMeta<TData extends RowData, TValue> {
        /** Applied to both the `<th>` and the matching `<td>`s. */
        className?: string;
        align?: "left" | "center" | "right";
    }
}

export {};
