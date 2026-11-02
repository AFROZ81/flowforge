import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { normalizeError } from "@/lib/errors";

import { AuthPasswordField, AuthTextField } from "./AuthFields";
import { useLogin } from "../hooks/useLogin";
import {
    loginSchema,
    type LoginFormValues,
} from "../validation/login.schema";

type Props = {
    /** Carried over from a successful sign-up. */
    defaultEmail?: string;
    onSwitchToRegister: () => void;
};

/*
 * This is one face of AuthCard, so it owns no Card, no width and no entrance
 * animation — the shell that flips it does all three.
 *
 * Labels are visually hidden rather than absent: the composition carries no
 * label text, but `hideLabel` keeps the <label> in the DOM wired to its
 * control, so every field is still announced and still clickable via its
 * accessible name.
 *
 * "Remember me" and "Forgot password?" stay off this form on purpose. The
 * session store is pinned to sessionStorage and the API exposes no reset
 * endpoint, so either control would be a decoration that cannot do anything.
 */
export default function LoginForm({ defaultEmail, onSwitchToRegister }: Props) {
    const loginMutation = useLogin();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    /*
     * An account that was just created has to be typed in again otherwise —
     * hand it over instead. `reset` puts the value through react-hook-form
     * rather than mutating the DOM behind its back.
     */
    useEffect(() => {
        if (!defaultEmail) return;

        reset({ email: defaultEmail, password: "" });
    }, [defaultEmail, reset]);

    const busy = isSubmitting || loginMutation.isPending;

    async function onSubmit(data: LoginFormValues) {
        try {
            await loginMutation.mutateAsync(data);
            toast.success("Welcome back.");
        } catch (error) {
            /*
             * A wrong password and a dead API are different problems.
             * Saying "invalid email or password" for both sent people
             * rewriting credentials that were already correct.
             */
            const { title, description } = normalizeError(error, {
                title: "We couldn't sign you in",
                description:
                    "Check your email and password, then try again.",
            });

            toast.error(title, { description });
        }
    }

    return (
        <>
            <h1 className="font-heading text-[28px] leading-[1.1] font-semibold tracking-[-0.03em] text-balance text-foreground sm:text-[32px]">
                Welcome Back
            </h1>

            <form
                onSubmit={handleSubmit(onSubmit)}
                aria-busy={busy}
                className="mt-7 space-y-5"
            >
                <FormField
                    label="Email"
                    htmlFor="email"
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

                <FormField
                    label="Password"
                    htmlFor="password"
                    required
                    hideLabel
                    error={errors.password?.message}
                >
                    {(aria) => (
                        <AuthPasswordField
                            aria={aria}
                            autoComplete="current-password"
                            placeholder="Password"
                            disabled={busy}
                            registered={register("password")}
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
                            Signing in…
                        </>
                    ) : (
                        <>
                            Sign In
                            <ArrowRight
                                className="transition-transform duration-(--transition-fast) ease-(--ease-standard) group-hover/button:translate-x-0.5"
                                aria-hidden="true"
                            />
                        </>
                    )}
                </Button>
            </form>

            <p className="mt-6 text-center text-[13px] text-muted-foreground">
                New to FlowForge?{" "}
                <button
                    type="button"
                    onClick={onSwitchToRegister}
                    disabled={busy}
                    className="
                        font-medium text-auth-link underline-offset-4
                        transition-colors hover:underline
                        disabled:pointer-events-none disabled:opacity-50
                    "
                >
                    Create an account
                </button>
            </p>
        </>
    );
}
