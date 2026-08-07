import { z } from "zod";

export const createWorkItemSchema = z.object({
    columnId: z.string().uuid(),

    title: z
        .string()
        .min(1, "Title is required")
        .max(200),

    description: z
        .string()
        .max(2000)
        .optional()
        .or(z.literal("")),

    priority: z.number(),

    dueDate: z.string().optional(),
});

export type CreateWorkItemForm =
    z.infer<typeof createWorkItemSchema>;