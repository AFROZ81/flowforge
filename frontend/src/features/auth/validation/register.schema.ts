import { z } from "zod";

/*
 * Mirrors the two places the server checks this input:
 *
 *   RegisterValidator  — name required and <= 100, valid email,
 *                        password >= 8, confirm must match,
 *                        organization must be chosen (non-empty Guid)
 *   Identity options   — min 8, one upper, one lower, one digit;
 *                        no symbol required
 *
 * Validating here costs nothing and saves the user a round trip to discover
 * a rule they could have met on the first try.
 */
export const registerSchema = z
    .object({
        fullName: z
            .string()
            .trim()
            .min(1, "Please enter your name.")
            .max(100, "Keep the name under 100 characters."),

        email: z
            .string()
            .trim()
            .email("Please enter a valid email address."),

        password: z
            .string()
            .min(8, "Use at least 8 characters.")
            .regex(/[A-Z]/, "Include an uppercase letter.")
            .regex(/[a-z]/, "Include a lowercase letter.")
            .regex(/[0-9]/, "Include a number."),

        confirmPassword: z.string().min(1, "Confirm your password."),

        organizationId: z.string().min(1, "Choose a workspace."),
    })
    .refine((values) => values.password === values.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

export type RegisterFormValues = z.infer<typeof registerSchema>;
