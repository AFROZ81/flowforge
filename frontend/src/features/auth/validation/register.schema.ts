import { z } from "zod";

export const registerSchema = z.object({
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
}).refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const EMPTY_REGISTER_FORM: RegisterFormValues = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
};
