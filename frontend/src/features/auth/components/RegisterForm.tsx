import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowRight,
    Building2,
    Loader2,
    Mail,
    UserRound,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { normalizeError } from "@/lib/errors";

import { AuthPasswordField, AuthSelectField, AuthTextField } from "./AuthFields";
import { useOrganizationOptions } from "../hooks/useOrganizationOptions";
import { useRegister } from "../hooks/useRegister";
import {
    registerSchema,
    type RegisterFormValues,
} from "../validation/register.schema";

type Props = {
    onRegistered: (email: string) => void;
    onSwitchToLogin: () => void;
};

const EMPTY: RegisterFormValues = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationId: "",
};

export default function RegisterForm({
    onRegistered,
    onSwitchToLogin,
}: Props) {
    const mutation = useRegister();

    /*
     * This face only exists while it is showing, so asking for the workspace
     * list on mount is exactly the right time — a plain visit to /login never
     * requests it.
     */
    const organizations = useOrganizationOptions(true);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: EMPTY,
    });

    const busy = isSubmitting || mutation.isPending;

    const options = organizations.data ?? [];
    const hasOptions = options.length > 0;

    async function onSubmit(values: RegisterFormValues) {
        try {
            await mutation.mutateAsync({
                fullName: values.fullName,
                email: values.email,
                password: values.password,
                confirmPassword: values.confirmPassword,
                organizationId: values.organizationId,
            });

            toast.success("Account created", {
                description: "Sign in to reach your workspace.",
            });

            /*
             * Registration hands back an id, not a token, so the sign-in face
             * is next. Wipe everything except the address they just used —
             * that one is worth carrying over.
             */
            reset({ ...EMPTY, password: "", confirmPassword: "" });

            onRegistered(values.email);
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: "We couldn't create that account",
                description: "Please check the details and try again.",
            });

            toast.error(title, { description });
        }
    }

    return (
        <>
            <h1 className="font-heading text-[26px] leading-[1.1] font-semibold tracking-[-0.03em] text-balance text-foreground sm:text-[30px]">
                Create your account
            </h1>

            <form
                onSubmit={handleSubmit(onSubmit)}
                aria-busy={busy}
                className="mt-7 space-y-5"
            >
                <FormField
                    label="Full name"
                    htmlFor="register-full-name"
                    required
                    hideLabel
                    error={errors.fullName?.message}
                >
                    {(aria) => (
                        <AuthTextField
                            aria={aria}
                            icon={UserRound}
                            autoComplete="name"
                            placeholder="Full name"
                            disabled={busy}
                            registered={register("fullName")}
                        />
                    )}
                </FormField>

                <FormField
                    label="Email"
                    htmlFor="register-email"
                    required
                    hideLabel
                    error={errors.email?.message}
                >
                    {(aria) => (
                        <AuthTextField
                            aria={aria}
                            icon={Mail}
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder="you@company.com"
                            disabled={busy}
                            registered={register("email")}
                        />
                    )}
                </FormField>

                {organizations.isError ? (
                    /*
                     * A failed lookup is not a validation error on the field —
                     * there is nothing for the user to type differently — so it
                     * gets its own note and a way to retry without a page
                     * reload.
                     */
                    <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3">
                        <p className="text-[13px] text-danger-foreground">
                            We couldn't load the available workspaces.
                        </p>

                        <button
                            type="button"
                            onClick={() => void organizations.refetch()}
                            className="
                                mt-1.5 text-[13px] font-medium text-auth-link
                                underline-offset-4 transition-colors hover:underline
                            "
                        >
                            Try again
                        </button>
                    </div>
                ) : (
                    <FormField
                        label="Workspace"
                        htmlFor="register-organization"
                        required
                        hideLabel
                        error={errors.organizationId?.message}
                        hint={
                            !organizations.isLoading &&
                            !hasOptions &&
                            "No workspaces exist yet — one has to be created before you can sign up."
                        }
                    >
                        {(aria) => (
                            <AuthSelectField
                                aria={aria}
                                icon={Building2}
                                disabled={busy}
                                registered={register("organizationId")}
                            >
                                <option value="" disabled>
                                    {organizations.isLoading
                                        ? "Loading workspaces…"
                                        : hasOptions
                                          ? "Choose a workspace"
                                          : "No workspaces available"}
                                </option>

                                {options.map((organization) => (
                                    <option
                                        key={organization.id}
                                        value={organization.id}
                                    >
                                        {organization.name}
                                    </option>
                                ))}
                            </AuthSelectField>
                        )}
                    </FormField>
                )}

                <FormField
                    label="Password"
                    htmlFor="register-password"
                    required
                    hideLabel
                    error={errors.password?.message}
                    hint="At least 8 characters, with an uppercase letter, a lowercase letter and a number."
                >
                    {(aria) => (
                        <AuthPasswordField
                            aria={aria}
                            autoComplete="new-password"
                            placeholder="Password"
                            disabled={busy}
                            registered={register("password")}
                        />
                    )}
                </FormField>

                <FormField
                    label="Confirm password"
                    htmlFor="register-confirm-password"
                    required
                    hideLabel
                    error={errors.confirmPassword?.message}
                >
                    {(aria) => (
                        <AuthPasswordField
                            aria={aria}
                            autoComplete="new-password"
                            placeholder="Confirm password"
                            disabled={busy}
                            registered={register("confirmPassword")}
                        />
                    )}
                </FormField>

                <Button
                    type="submit"
                    className="h-12 w-full rounded-xl text-[15px] font-semibold"
                    disabled={busy}
                >
                    {busy ? (
                        <>
                            <Loader2 className="animate-spin" aria-hidden="true" />
                            Creating account…
                        </>
                    ) : (
                        <>
                            Create Account
                            <ArrowRight
                                className="transition-transform duration-(--transition-fast) ease-(--ease-standard) group-hover/button:translate-x-0.5"
                                aria-hidden="true"
                            />
                        </>
                    )}
                </Button>
            </form>

            <p className="mt-6 text-center text-[13px] text-muted-foreground">
                Already have an account?{" "}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    disabled={busy}
                    className="
                        font-medium text-auth-link underline-offset-4
                        transition-colors hover:underline
                        disabled:pointer-events-none disabled:opacity-50
                    "
                >
                    Sign in
                </button>
            </p>
        </>
    );
}
