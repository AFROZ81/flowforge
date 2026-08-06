import { z } from "zod";

export const createProjectSchema = z.object({
    name: z
        .string()
        .min(3, "Project name must be at least 3 characters"),

    key: z
        .string()
        .min(2)
        .max(8)
        .regex(/^[A-Z]+$/, "Only uppercase letters"),

    description: z.string().optional(),

    color: z.string(),

    icon: z.string(),
});

export type CreateProjectForm =
    z.infer<typeof createProjectSchema>;