import { z } from "zod";

export const renameWorkItemSchema =
    z.object({
        title: z
            .string()
            .trim()
            .min(
                1,
                "Title is required."
            )
            .max(
                200,
                "Title cannot exceed 200 characters."
            ),
    });

export type RenameWorkItemForm =
    z.infer<
        typeof renameWorkItemSchema
    >;