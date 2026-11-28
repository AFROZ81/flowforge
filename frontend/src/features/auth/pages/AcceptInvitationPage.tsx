import { useState } from "react";
import { Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, Mail, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth.store";
import {
    useAcceptInvitation,
    useInvitationDetails,
} from "@/features/settings/hooks/useInvitations";
import { cn } from "@/lib/utils";
import { normalizeError } from "@/lib/errors";
import { useRegister } from "../hooks/useRegister";

export default function AcceptInvitationPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuthStore();
    const acceptInvitation = useAcceptInvitation();
    const register = useRegister();
    const isSubmitting = acceptInvitation.isPending || register.isPending;
    const { data: invitationDetails, isLoading: detailsLoading } =
        useInvitationDetails(searchParams.get("token") ?? "");

    const token = searchParams.get("token");
    const [acceptedToken, setAcceptedToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [registerForm, setRegisterForm] = useState({
        fullName: "",
        password: "",
        confirmPassword: "",
    });

    const invitationError = !token
        ? "Invalid invitation link. No token provided."
        : !detailsLoading && !invitationDetails
          ? "Invalid or expired invitation token."
          : invitationDetails?.isAccepted
            ? "This invitation has already been accepted."
            : null;

    const step = acceptedToken === token
        ? "success"
        : invitationError
          ? "error"
          : detailsLoading
            ? "loading"
            : isAuthenticated
              ? "verify"
              : "register";

    const visibleError = invitationError ?? error;

    if (token && !isAuthenticated) {
        return (
            <Navigate
                to={`/login?mode=register&invitationToken=${encodeURIComponent(token)}`}
                replace
            />
        );
    }

    const tryAcceptInvitation = async () => {
        if (!token) return;

        try {
            setError(null);
            const response = await acceptInvitation.mutateAsync(token!);

            login(response.accessToken, response.expiresAtUtc);
            setAcceptedToken(token);
        } catch (err) {
            const { description } = normalizeError(err, {
                title: "Failed to accept invitation",
            });
            setError(description);
        }
    };

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();

        if (isSubmitting) return;

        if (registerForm.password !== registerForm.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (registerForm.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        try {
            setError(null);

            const registerData = await register.mutateAsync({
                fullName: registerForm.fullName,
                email: invitationDetails?.email || "",
                password: registerForm.password,
                confirmPassword: registerForm.confirmPassword,
                invitationToken: token ?? undefined,
            });

            const { accessToken, expiresAtUtc } = registerData.data;

            if (!accessToken || !expiresAtUtc) {
                throw new Error("Invitation acceptance did not return a session.");
            }

            login(accessToken, expiresAtUtc);
            setAcceptedToken(token);
        } catch (err) {
            const { description } = normalizeError(err, {
                title: "Registration failed",
            });
            setError(description);
        }
    };

    const goToLogin = () => {
        navigate(token
            ? `/login?mode=signin&invitationToken=${encodeURIComponent(token)}`
            : "/login");
    };

    if (step === "loading" || detailsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4 p-8">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Verifying invitation...</p>
                </div>
            </div>
        );
    }

    if (step === "error") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md border-destructive/30">
                    <CardHeader className="text-center">
                        <AlertCircle className="size-12 mx-auto text-destructive mb-4" />
                        <CardTitle>Invalid Invitation</CardTitle>
                        <CardDescription>{visibleError}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center">
                        <Button variant="outline" onClick={goToLogin}>
                            Go to Login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (step === "success") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CheckCircle2 className="size-12 mx-auto text-success mb-4" />
                        <CardTitle>Welcome aboard!</CardTitle>
                        <CardDescription>
                            You've successfully joined {invitationDetails?.organizationName || "the organization"}.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex flex-col gap-2">
                        <Button onClick={() => navigate("/")}>
                            <ArrowRight className="size-4 ml-2" />
                            Go to Dashboard
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // For both verify and register steps, show the invitation card
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Mail className="size-12 mx-auto text-primary mb-4" />
                    <CardTitle>You're invited!</CardTitle>
                    <CardDescription>
                        {step === "verify"
                            ? "Click below to accept this invitation and join the organization."
                            : "Create an account to accept this invitation."}
                    </CardDescription>
                    {invitationDetails && (
                        <div className="mt-4 text-sm text-muted-foreground">
                            <p>
                                <strong>Organization:</strong> {invitationDetails.organizationName}
                            </p>
                            <p>
                                <strong>Role:</strong> {invitationDetails.role}
                            </p>
                            <p>
                                <strong>Invited to:</strong> {invitationDetails.email}
                            </p>
                        </div>
                    )}
                </CardHeader>

                <Separator className="my-4" />

                <CardContent className="space-y-4">
                    {step === "verify" && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground text-center">
                                This invitation was sent to your email address.
                            </p>

                            <Button
                                className="w-full"
                                size="lg"
                                onClick={tryAcceptInvitation}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="size-4 mr-2 animate-spin" />
                                        Accepting...
                                    </>
                                ) : (
                                    "Accept Invitation"
                                )}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground">
                                By accepting, you agree to the Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    )}

                    {step === "register" && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground text-center">
                                Create an account to accept this invitation.
                            </p>

                            <form onSubmit={handleRegister} aria-busy={isSubmitting} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        value={registerForm.fullName}
                                        onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                                        placeholder="John Doe"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={invitationDetails?.email || ""}
                                        disabled
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={registerForm.password}
                                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                        placeholder="At least 8 characters"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={registerForm.confirmPassword}
                                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                                        placeholder="Confirm password"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {error && (
                                    <div className={cn(
                                        "p-3 rounded-lg text-sm text-destructive bg-destructive/10 border border-destructive/20"
                                    )}>
                                        {error}
                                    </div>
                                )}

                                <Button
                                    className="w-full"
                                    size="lg"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="size-4 mr-2 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        "Create Account & Accept"
                                    )}
                                </Button>
                            </form>

                            <p className="text-xs text-center text-muted-foreground">
                                Already have an account?{" "}
                                <Button variant="ghost" size="sm" className="p-0" onClick={goToLogin}>
                                    Sign in instead
                                </Button>
                            </p>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-center">
                    <Button variant="ghost" onClick={goToLogin}>
                        Back to Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
