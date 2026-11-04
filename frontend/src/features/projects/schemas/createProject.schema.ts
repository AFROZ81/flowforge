import { z } from "zod";

export const createProjectSchema = z.object({
    name: z
        .string()
        .min(3, "Project name must be at least 3 characters")
        /* The server caps it at 100; matching here fails before a round trip. */
        .max(100, "Project name must be 100 characters or fewer"),

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