import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowRight,
    Building2,
    Loader2,
    Mail,
    UserRound,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/stores/auth.store";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { normalizeError } from "@/lib/errors";

import { AuthPasswordField, AuthSelectField, AuthTextField } from "./AuthFields";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import { toOrganizationSlug } from "../lib/organization-slug";
import { useCreateOrganization } from "../hooks/useCreateOrganization";
import { useOrganizationOptions } from "../hooks/useOrganizationOptions";
import { useRegister } from "../hooks/useRegister";
import { useInvitationDetails } from "@/features/settings/hooks/useInvitations";
import {
    buildRegisterSchema,
    EMPTY_REGISTER_FORM,
    type RegisterFormValues,
} from "../validation/register.schema";

type Props = {
    invitationToken?: string;
    onRegistered: (email: string) => void;
    onSwitchToLogin: () => void;
};

export default function RegisterForm({
    invitationToken,
    onRegistered,
    onSwitchToLogin,
}: Props) {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const mutation = useRegister();
    const createOrganization = useCreateOrganization();
    const isInvitationRegistration = Boolean(invitationToken);
    const invitation = useInvitationDetails(invitationToken ?? "");

    /*
     * This face only exists while it is showing, so asking for the workspace
     * list on mount is exactly the right time — a plain visit to /login never
     * requests it.
     */
    const organizations = useOrganizationOptions(!isInvitationRegistration);

    const options = organizations.data ?? [];

    /*
     * The first run against an empty database: the list came back with nothing
     * in it. There is nothing to choose and no other way to make one, so the
     * form asks for a name instead and creates the workspace itself.
     */
    const needsWorkspaceName =
        !isInvitationRegistration &&
        !organizations.isLoading &&
        !organizations.isError &&
        options.length === 0;

    const schema = useMemo(
        () => buildRegisterSchema(needsWorkspaceName, isInvitationRegistration),
        [needsWorkspaceName, isInvitationRegistration],
    );

    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(schema),
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
        createOrganization.isPending ||
        (isInvitationRegistration && invitation.isLoading);

    /*
     * Read live because the meter moves while the field is being typed.
     * `useWatch` rather than the form's `watch`: it subscribes to this one
     * field, and it is a hook the React rules can reason about. Display only —
     * the rules that decide whether the form submits stay in the schema.
     */
    const password = useWatch({ control, name: "password" });

    async function onSubmit(values: RegisterFormValues) {
        if (busy || invitationError) return;

        try {
            /*
             * Two calls, in order, when no workspace exists yet: make one, then
             * put the account inside it. The slug is derived rather than typed —
             * name and slug are the same idea in different cases, and asking for
             * both would only invite a mismatch.
             */
            let organizationId = values.organizationId;

            if (!isInvitationRegistration && needsWorkspaceName) {
                const name = values.organizationName.trim();

                const created = await createOrganization.mutateAsync({
                    name,
                    slug: toOrganizationSlug(name),
                });

                organizationId = created.id;
            }

            const response = await mutation.mutateAsync({
                fullName: values.fullName,
                email: values.email,
                password: values.password,
                confirmPassword: values.confirmPassword,
                organizationId: isInvitationRegistration ? undefined : organizationId,
                invitationToken,
            });

            if (isInvitationRegistration) {
                const { accessToken, expiresAtUtc } = response.data;

                if (!accessToken || !expiresAtUtc) {
                    throw new Error("Invitation acceptance did not return a session.");
                }

                login(accessToken, expiresAtUtc);
                toast.success("Invitation accepted", {
                    description: `Welcome to ${invitation.data?.organizationName || "your workspace"}.`,
                });
                navigate("/dashboard", { replace: true });
                return;
            }

            toast.success("Account created", {
                description: "Sign in to reach your workspace.",
            });

            /*
             * Registration hands back an id, not a token, so the sign-in face
             * is next. Wipe everything except the address they just used —
             * that one is worth carrying over.
             */
            reset({
                ...EMPTY_REGISTER_FORM,
                password: "",
                confirmPassword: "",
            });

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

                {!isInvitationRegistration && (organizations.isError ? (
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
                ) : needsWorkspaceName ? (
                    /*
                     * Nothing to choose, so this asks for a name and the submit
                     * handler creates the workspace before the account. What used
                     * to be here only said that a workspace had to exist first,
                     * with no way to make one from the form.
                     */
                    <FormField
                        label="Workspace name"
                        htmlFor="register-organization-name"
                        required
                        hideLabel
                        error={errors.organizationName?.message}
                        hint="This is the first workspace — your account is created inside it."
                    >
                        {(aria) => (
                            <AuthTextField
                                aria={aria}
                                icon={Building2}
                                autoComplete="organization"
                                placeholder="Workspace name"
                                disabled={busy}
                                registered={register("organizationName")}
                            />
                        )}
                    </FormField>
                ) : (
                    <FormField
                        label="Workspace"
                        htmlFor="register-organization"
                        required
                        hideLabel
                        error={errors.organizationId?.message}
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
                                        : "Choose a workspace"}
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
                ))}

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
                                : createOrganization.isPending
                                  ? "Creating workspace…"
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

            {!isInvitationRegistration && (
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
            )}
        </>
    );
}
