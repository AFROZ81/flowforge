import { z } from "zod";

/*
 * Mirrors the two places the server checks this input:
 *
 *   RegisterValidator  — name required and <= 100, valid email,
 *                        password >= 8, confirm must match,
 *                        organization must be chosen (non-empty Guid)
 *   CreateOrganizationValidator — workspace name required and <= 150,
 *                        slug required and <= 150 (derived here, never typed)
 *   Identity options   — min 8, one upper, one lower, one digit;
 *                        no symbol required
 *
 * Validating here costs nothing and saves the user a round trip to discover
 * a rule they could have met on the first try.
 */

const registerFields = z.object({
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

    /*
     * Both workspace fields are always on the form state and both are plain
     * strings, so the shape is identical either way and only which one is
     * required changes. That keeps the resolver swappable mid-session without
     * react-hook-form ever seeing a different object shape.
     */
    organizationId: z.string(),
    organizationName: z.string(),
});

export type RegisterFormValues = z.infer<typeof registerFields>;

/** Starting state for both faces of the field set. */
export const EMPTY_REGISTER_FORM: RegisterFormValues = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationId: "",
    organizationName: "",
};

/**
 * Builds the rules for one of the two possible workspace situations.
 *
 * `needsWorkspaceName` is true only when the workspace list came back empty —
 * the first run against a fresh database. There is nothing to choose then, and
 * `POST /api/Organizations` is anonymous, so the form asks for a name and
 * creates the workspace itself instead of leaving the user at a dead end.
 */
export function buildRegisterSchema(
    needsWorkspaceName: boolean,
    invitationRegistration = false,
) {
    return registerFields
        .refine((values) => values.password === values.confirmPassword, {
            message: "Passwords do not match.",
            path: ["confirmPassword"],
        })
        .superRefine((values, report) => {
            if (invitationRegistration) return;

            if (needsWorkspaceName) {
                /*
                 * The two-character floor is ours, not the API's: it exists so
                 * a workspace has a name worth showing in the sidebar rather
                 * than a single keystroke.
                 */
                const name = values.organizationName.trim();

                if (name.length < 2) {
                    report.addIssue({
                        code: "custom",
                        path: ["organizationName"],
                        message:
                            "Give the workspace a name of at least 2 characters.",
                    });
                } else if (name.length > 150) {
                    report.addIssue({
                        code: "custom",
                        path: ["organizationName"],
                        message: "Keep the workspace name under 150 characters.",
                    });
                }

                return;
            }

            if (!values.organizationId) {
                report.addIssue({
                    code: "custom",
                    path: ["organizationId"],
                    message: "Choose a workspace.",
                });
            }
        });
}
