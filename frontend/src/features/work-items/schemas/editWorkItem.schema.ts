import { z } from "zod";

export const editWorkItemSchema = z.object({
    description: z
        .string()
        .max(
            2000,
            "Description cannot exceed 2000 characters."
        )
        .optional()
        .or(z.literal("")),

    priority: z
        .number()
        .int()
        .min(1)
        .max(4),

    dueDate: z
        .string()
        .optional(),
});

export type EditWorkItemForm =
    z.infer<typeof editWorkItemSchema>;