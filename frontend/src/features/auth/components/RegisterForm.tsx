import { useEffect } from "react";
import { ArrowRight, Loader2, Mail, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/stores/auth.store";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { normalizeError } from "@/lib/errors";

import { AuthPasswordField, AuthTextField } from "./AuthFields";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import { useRegister } from "../hooks/useRegister";
import { useInvitationDetails } from "@/features/settings/hooks/useInvitations";
import {
    EMPTY_REGISTER_FORM,
    registerSchema,
    type RegisterFormValues,
} from "../validation/register.schema";

type Props = {
    invitationToken?: string;
    onSwitchToLogin: () => void;
};

export default function RegisterForm({
    invitationToken,
    onSwitchToLogin,
}: Props) {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const mutation = useRegister();
    const isInvitationRegistration = Boolean(invitationToken);
    const invitation = useInvitationDetails(invitationToken ?? "");

    const {
        control,
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: EMPTY_REGISTER_FORM,
    });

    const invitationError = !isInvitationRegistration
        ? null
        : invitation.isLoading
          ? null
          : invitation.isError || !invitation.data
            ? "This invitation is invalid or expired."
            : invitation.data.isAccepted
              ? "This invitation has already been accepted."
              : null;

    useEffect(() => {
        if (!isInvitationRegistration || !invitation.data?.email) return;

        setValue("email", invitation.data.email, { shouldDirty: false });
    }, [isInvitationRegistration, invitation.data?.email, setValue]);

    const busy =
        isSubmitting ||
        mutation.isPending ||
        (isInvitationRegistration && invitation.isLoading);

    const password = useWatch({ control, name: "password" });

    async function onSubmit(values: RegisterFormValues) {
        if (busy || invitationError) return;

        try {
            const response = await mutation.mutateAsync({
                fullName: values.fullName,
                email: values.email,
                password: values.password,
                confirmPassword: values.confirmPassword,
                invitationToken,
            });

            const { accessToken, expiresAtUtc } = response.data;

            if (!accessToken || !expiresAtUtc) {
                throw new Error("Registration did not return a session.");
            }

            login(accessToken, expiresAtUtc);

            toast.success(
                isInvitationRegistration ? "Invitation accepted" : "Account created",
                {
                    description: isInvitationRegistration
                        ? `Welcome to ${invitation.data?.organizationName || "your workspace"}.`
                        : "Create a workspace or accept an invitation to continue.",
                }
            );

            navigate(isInvitationRegistration ? "/dashboard" : "/onboarding", {
                replace: true,
            });
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

            {isInvitationRegistration && (
                <div className={`mt-5 rounded-xl border px-4 py-3 text-[13px] ${invitationError ? "border-danger/30 bg-danger/10 text-danger-foreground" : "border-border bg-surface-muted/50 text-muted-foreground"}`}>
                    {invitation.isLoading ? (
                        "Verifying your invitation…"
                    ) : invitationError ? (
                        invitationError
                    ) : (
                        <>
                            Join <strong className="font-semibold text-foreground">{invitation.data?.organizationName}</strong> as <strong className="font-semibold text-foreground">{invitation.data?.role}</strong>.
                        </>
                    )}
                </div>
            )}

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
                            disabled={busy || isInvitationRegistration}
                            registered={register("email")}
                        />
                    )}
                </FormField>

                <FormField
                    label="Password"
                    htmlFor="register-password"
                    required
                    hideLabel
                    error={errors.password?.message}
                    hint="At least 8 characters, with an uppercase letter, a lowercase letter and a number."
                    under={<PasswordStrengthMeter value={password} />}
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
                    disabled={busy || Boolean(invitationError)}
                >
                    {busy ? (
                        <>
                            <Loader2 className="animate-spin" aria-hidden="true" />
                            {isInvitationRegistration && invitation.isLoading
                                ? "Verifying invitation…"
                                : "Creating account…"}
                        </>
                    ) : (
                        <>
                            {isInvitationRegistration ? "Create Account & Accept" : "Create Account"}
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
                        className="font-medium text-auth-link underline-offset-4 transition-colors hover:underline disabled:pointer-events-none disabled:opacity-50"
                    >
                        Sign in
                    </button>
                </p>
            </>
    );
}
