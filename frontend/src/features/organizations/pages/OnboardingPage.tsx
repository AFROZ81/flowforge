import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
    ArchiveRestore,
    ArrowRight,
    Building2,
    Loader2,
    LockKeyhole,
    LogOut,
    Mail,
    Rocket,
    ShieldCheck,
    Sparkles,
    Trash2,
    UserPlus,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { normalizeError } from "@/lib/errors";
import { useAuthStore } from "@/stores/auth.store";

import Logo from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAcceptInvitation, useInvitationDetails } from "@/features/settings/hooks/useInvitations";

import CreateOrganizationForm from "../components/CreateOrganizationForm";
import {
    useMyOrganizations,
    useDeleteOrganization,
    useRestoreOrganization,
} from "../hooks/useOrganizations";
import type { OrganizationMembership } from "../types/organization.types";

const SETUP_STEPS = [
    {
        icon: Building2,
        title: "Create your workspace",
        description: "Give your team a private place to plan and deliver work.",
    },
    {
        icon: UserPlus,
        title: "Invite your teammates",
        description: "Add people by email and choose the right role for them.",
    },
    {
        icon: Rocket,
        title: "Start moving work",
        description: "Create projects, boards, and your first work items.",
    },
];

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const invitationToken = params.get("invitationToken")?.trim() ?? "";
    const [token, setToken] = useState(invitationToken);
    const [deleteTarget, setDeleteTarget] = useState<OrganizationMembership | null>(null);
    const [confirmationSlug, setConfirmationSlug] = useState("");
    const [switchingId, setSwitchingId] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);
    const switchOrganization = useAuthStore((state) => state.switchOrganization);
    const currentUser = useAuthStore((state) => state.user);
    const currentOrganizationId = currentUser?.organizationId ?? "";
    const organizations = useMyOrganizations();
    const invitation = useInvitationDetails(invitationToken);
    const acceptInvitation = useAcceptInvitation();
    const restoreOrganization = useRestoreOrganization();
    const deleteOrganization = useDeleteOrganization();

    const activeMemberships = organizations.data?.filter(
        (organization) => organization.isActive
    ) ?? [];
    const currentMembership = activeMemberships.find(
        (organization) => organization.id === currentOrganizationId
    );
    const invitationError = invitationToken
        ? invitation.isLoading
            ? null
            : invitation.isError || !invitation.data || invitation.data.isAccepted
                ? "This invitation is invalid, expired, or already accepted."
                : null
        : null;

    useEffect(() => {
        if (!invitationToken && currentMembership) {
            navigate("/dashboard", { replace: true });
        }
    }, [invitationToken, currentMembership, navigate]);

    function applySession(session: {
        accessToken: string;
        expiresAtUtc: string;
        organizationId: string | null;
    }) {
        login(session.accessToken, session.expiresAtUtc);
        navigate(session.organizationId ? "/dashboard" : "/onboarding", {
            replace: true,
        });
    }

    function handleCreate(session: {
        accessToken: string;
        expiresAtUtc: string;
        organizationId: string | null;
    }) {
        applySession(session);
    }

    async function handleSwitch(organizationId: string) {
        setSwitchingId(organizationId);

        try {
            await switchOrganization(organizationId);
            await queryClient.invalidateQueries();
            navigate("/dashboard", { replace: true });
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: "We couldn't open that workspace",
            });

            toast.error(title, { description });
        } finally {
            setSwitchingId(null);
        }
    }

    async function handleAccept(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!token.trim()) {
            toast.error("Paste the invitation token from your email.");
            return;
        }

        if (invitationError) {
            toast.error(invitationError);
            return;
        }

        try {
            const result = await acceptInvitation.mutateAsync(token.trim());
            login(result.accessToken, result.expiresAtUtc);
            await queryClient.invalidateQueries();
            navigate("/dashboard", { replace: true });
            toast.success("Invitation accepted");
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: "We couldn't accept that invitation",
            });

            toast.error(title, { description });
        }
    }

    async function handleRestore(organizationId: string) {
        try {
            const session = await restoreOrganization.mutateAsync(organizationId);
            applySession(session);
            toast.success("Workspace restored.");
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: "We couldn't restore that workspace",
            });

            toast.error(title, { description });
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;

        try {
            const session = await deleteOrganization.mutateAsync({
                organizationId: deleteTarget.id,
                confirmationSlug,
            });
            setDeleteTarget(null);
            setConfirmationSlug("");
            applySession(session);
            toast.success("Workspace deleted.");
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: "We couldn't delete that workspace",
            });

            toast.error(title, { description });
        }
    }

    const archivedOwned = organizations.data?.filter(
        (organization) => !organization.isActive && organization.isOwner
    ) ?? [];

    return (
        <>
            <main className="relative min-h-dvh overflow-hidden bg-background">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-linear-to-b from-primary-subtle/55 via-background to-background" />

                    <div
                        className="absolute inset-0 opacity-35"
                        style={{
                            backgroundImage:
                                "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
                            backgroundSize: "64px 64px",
                            maskImage:
                                "radial-gradient(ellipse at 50% 38%, black 5%, transparent 72%)",
                            WebkitMaskImage:
                                "radial-gradient(ellipse at 50% 38%, black 5%, transparent 72%)",
                        }}
                    />

                    <div className="absolute -top-24 -right-20 hidden size-[30rem] rotate-12 rounded-[5rem] border border-border/50 bg-surface-muted/15 lg:block" />
                    <div className="absolute top-28 -right-6 hidden size-72 -rotate-12 rounded-[3.5rem] border border-primary/15 bg-primary-subtle/10 lg:block" />
                    <div className="absolute bottom-16 left-[7%] hidden size-28 rounded-full border border-border/50 bg-card/20 lg:block" />
                    <div className="absolute bottom-28 left-[11%] hidden size-3 rounded-full bg-primary/30 lg:block" />
                </div>

                <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                    <header className="flex items-center justify-between gap-4 border-b border-border/60 pb-5">
                        <Logo size="lg" />

                        <div className="flex items-center gap-3">
                            <div className="hidden min-w-0 text-right sm:block">
                                <p className="truncate text-xs font-semibold text-foreground">
                                    {currentUser?.fullName ?? "Your account"}
                                </p>
                                <p className="max-w-52 truncate text-[11px] text-muted-foreground">
                                    {currentUser?.email}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={logout}
                                className="shrink-0"
                            >
                                <LogOut className="size-4" />
                                Sign out
                            </Button>
                        </div>
                    </header>

                    <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)] lg:gap-16 lg:py-14">
                        <section className="min-w-0">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/70 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-primary uppercase backdrop-blur-sm">
                                <Sparkles className="size-3.5" />
                                One more step
                            </div>

                            <h1 className="mt-5 max-w-xl font-heading text-4xl leading-[1.04] font-semibold tracking-[-0.045em] text-foreground sm:text-5xl lg:text-[3.4rem]">
                                Set up your workspace
                            </h1>

                            <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground">
                                Create a new workspace for your team, or accept an invitation to join an existing one. Everything stays private and organized from day one.
                            </p>

                            <ol className="mt-8 grid gap-2.5 sm:grid-cols-3">
                                {SETUP_STEPS.map((step, index) => {
                                    const Icon = step.icon;

                                    return (
                                        <li
                                            key={step.title}
                                            className="group rounded-xl border border-border/70 bg-card/55 p-3.5 backdrop-blur-sm transition-colors hover:border-primary/25 hover:bg-card/80"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface-muted/70 text-primary">
                                                    <Icon className="size-4" strokeWidth={1.9} />
                                                </span>
                                                <span className="text-[10px] font-semibold tabular-nums text-muted-foreground/70">
                                                    0{index + 1}
                                                </span>
                                            </div>
                                            <h2 className="mt-3 text-[13px] leading-snug font-semibold text-foreground">
                                                {step.title}
                                            </h2>
                                            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                                                {step.description}
                                            </p>
                                        </li>
                                    );
                                })}
                            </ol>

                            <div className="mt-5 flex max-w-xl items-start gap-3 rounded-xl border border-border/70 bg-card/55 px-4 py-3.5 backdrop-blur-sm">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success-subtle text-success-foreground">
                                    <LockKeyhole className="size-4" strokeWidth={1.9} />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[13px] font-semibold text-foreground">
                                        Private by default
                                    </p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                        FlowForge never lists organizations publicly. People join your workspace only when you invite them.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <div className="w-full min-w-0 max-w-md justify-self-center lg:justify-self-end">
                            {activeMemberships.length > 0 && !currentMembership && (
                                <section className="mb-3 rounded-xl border border-border bg-card/85 p-3.5 backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="size-4 text-primary" />
                                        <h2 className="text-sm font-semibold text-foreground">
                                            Choose a workspace
                                        </h2>
                                    </div>
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        Your account still has an active workspace. Open it to continue.
                                    </p>
                                    <div className="mt-3 space-y-2">
                                        {activeMemberships.map((organization) => (
                                            <div
                                                key={organization.id}
                                                className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-surface-muted/35 px-3 py-2"
                                            >
                                                <span className="min-w-0">
                                                    <span className="block truncate text-sm font-medium text-foreground">
                                                        {organization.name}
                                                    </span>
                                                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                                                        {organization.role}
                                                    </span>
                                                </span>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => void handleSwitch(organization.id)}
                                                    disabled={switchingId !== null}
                                                    className="shrink-0"
                                                >
                                                    {switchingId === organization.id ? (
                                                        <Loader2 className="size-4 animate-spin" />
                                                    ) : null}
                                                    Open workspace
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {organizations.error && (
                                <div
                                    role="alert"
                                    className="mb-3 rounded-xl border border-destructive/30 bg-danger-subtle/40 p-3.5 text-sm text-danger-foreground backdrop-blur-sm"
                                >
                                    <p className="font-medium">We couldn't load your workspace memberships.</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-2.5"
                                        onClick={() => void organizations.refetch()}
                                    >
                                        Retry
                                    </Button>
                                </div>
                            )}

                            {archivedOwned.length > 0 && (
                                <section className="mb-3 rounded-xl border border-border bg-card/85 p-3.5 backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <ArchiveRestore className="size-4 text-warning-foreground" />
                                        <h2 className="text-sm font-semibold text-foreground">
                                            Archived workspaces
                                        </h2>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        {archivedOwned.map((organization) => (
                                            <div
                                                key={organization.id}
                                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 bg-surface-muted/35 px-3 py-2"
                                            >
                                                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                                                    {organization.name}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => void handleRestore(organization.id)}
                                                        disabled={restoreOrganization.isPending || deleteOrganization.isPending}
                                                    >
                                                        Restore
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-destructive hover:bg-danger-subtle hover:text-danger-foreground"
                                                        onClick={() => {
                                                            setDeleteTarget(organization);
                                                            setConfirmationSlug("");
                                                        }}
                                                        disabled={restoreOrganization.isPending || deleteOrganization.isPending}
                                                    >
                                                        <Trash2 className="size-4" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <div className="rounded-[1.6rem] border border-border/80 bg-card/70 p-2 shadow-lg backdrop-blur-md">
                                <section className="relative overflow-hidden rounded-[1.25rem] border border-primary/20 bg-linear-to-br from-primary-subtle/55 via-card to-card p-5 sm:p-6">
                                    <div
                                        aria-hidden="true"
                                        className="absolute -top-12 -right-10 size-36 rounded-full border border-primary/10"
                                    />
                                    <div className="relative flex items-start justify-between gap-3">
                                        <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                                            <Building2 className="size-5" strokeWidth={1.9} />
                                        </span>
                                        <span className="rounded-full border border-primary/20 bg-card/75 px-2.5 py-1 text-[10px] font-semibold text-primary">
                                            Recommended
                                        </span>
                                    </div>

                                    <h2 className="relative mt-4 font-heading text-xl font-semibold tracking-[-0.02em] text-foreground">
                                        Create a workspace
                                    </h2>
                                    <p className="relative mt-1 text-[13px] leading-relaxed text-muted-foreground">
                                        Start fresh with a private workspace. You become its Owner and first Admin.
                                    </p>

                                    <div className="relative mt-5">
                                        <CreateOrganizationForm onCreated={handleCreate} />
                                    </div>

                                    <div className="relative mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                                        <ShieldCheck className="size-3.5 text-success-foreground" />
                                        You control the workspace, roles, and invitations.
                                    </div>
                                </section>

                                <div className="flex items-center gap-3 px-5 py-2" aria-hidden="true">
                                    <span className="h-px flex-1 bg-border" />
                                    <span className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                        Or
                                    </span>
                                    <span className="h-px flex-1 bg-border" />
                                </div>

                                <section className="rounded-[1.25rem] bg-surface-muted/35 p-5 sm:p-6">
                                    <div className="flex items-start gap-3">
                                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-info/20 bg-info-subtle text-info-foreground">
                                            <Mail className="size-5" strokeWidth={1.9} />
                                        </span>
                                        <div className="min-w-0">
                                            <h2 className="font-heading text-lg font-semibold tracking-[-0.015em] text-foreground">
                                                Accept an invitation
                                            </h2>
                                            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                                                Use the token from your invitation email to join your team.
                                            </p>
                                        </div>
                                    </div>

                                    {invitationToken && invitation.data && (
                                        <div className="mt-4 rounded-lg border border-info/20 bg-info-subtle/35 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                                            Invitation for{" "}
                                            <strong className="font-semibold text-foreground">
                                                {invitation.data.email}
                                            </strong>{" "}
                                            to join{" "}
                                            <strong className="font-semibold text-foreground">
                                                {invitation.data.organizationName}
                                            </strong>
                                            .
                                        </div>
                                    )}

                                    {invitationError && (
                                        <p
                                            role="alert"
                                            className="mt-4 rounded-lg border border-destructive/30 bg-danger-subtle px-3 py-2.5 text-xs leading-relaxed text-danger-foreground"
                                        >
                                            {invitationError}
                                        </p>
                                    )}

                                    <form onSubmit={handleAccept} className="mt-5 space-y-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="invitation-token">Invitation token</Label>
                                            <div className="relative">
                                                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="invitation-token"
                                                    value={token}
                                                    onChange={(event) => setToken(event.target.value)}
                                                    placeholder="Paste invitation token"
                                                    disabled={acceptInvitation.isPending || Boolean(invitationError)}
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="submit"
                                            variant="outline"
                                            className="w-full justify-between"
                                            disabled={acceptInvitation.isPending || Boolean(invitationError)}
                                        >
                                            <span>
                                                {acceptInvitation.isPending ? "Accepting…" : "Accept invitation"}
                                            </span>
                                            {acceptInvitation.isPending ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <ArrowRight className="size-4" />
                                            )}
                                        </Button>
                                    </form>
                                </section>
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                                <ShieldCheck className="size-3.5" />
                                Private by default · Invite-only joining
                            </div>
                        </div>
                    </div>

                    <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
                        <span>FlowForge workspace setup</span>
                        <span>One account. As many workspaces as you need.</span>
                    </footer>
                </div>
            </main>

            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open && !deleteOrganization.isPending) {
                        setDeleteTarget(null);
                        setConfirmationSlug("");
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete {deleteTarget?.name ?? "workspace"}?</DialogTitle>
                        <DialogDescription>
                            This is a terminal soft delete. The workspace and its history are retained, but it cannot be restored or rejoined.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <Label htmlFor="delete-confirmation-slug">
                            Type <strong>{deleteTarget?.slug}</strong> to confirm
                        </Label>
                        <Input
                            id="delete-confirmation-slug"
                            value={confirmationSlug}
                            onChange={(event) => setConfirmationSlug(event.target.value)}
                            disabled={deleteOrganization.isPending}
                            autoComplete="off"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                            disabled={deleteOrganization.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => void handleDelete()}
                            disabled={
                                deleteOrganization.isPending ||
                                confirmationSlug.trim() !== deleteTarget?.slug
                            }
                        >
                            {deleteOrganization.isPending ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Deleting…
                                </>
                            ) : (
                                "Delete workspace"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
