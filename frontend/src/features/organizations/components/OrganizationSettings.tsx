import { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
    Archive,
    ArrowRightLeft,
    Building2,
    Loader2,
    LogOut,
    Pencil,
    Save,
    ShieldCheck,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { normalizeError } from "@/lib/errors";
import { useAuthStore } from "@/stores/auth.store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useConfirm } from "@/components/common/confirm";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import MembersSettings from "@/features/settings/components/MembersSettings";
import { useMembers } from "@/features/settings/hooks/useInvitations";

import {
    useArchiveOrganization,
    useLeaveOrganization,
    useOrganizationProfile,
    useTransferOwnership,
    useUpdateOrganization,
} from "../hooks/useOrganizations";
import type { OrganizationSession } from "../types/organization.types";

export default function OrganizationSettings() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const confirm = useConfirm();
    const organizationId = useAuthStore((state) => state.user?.organizationId ?? "");
    const selfId = useAuthStore((state) => state.user?.id ?? "");
    const login = useAuthStore((state) => state.login);
    const profile = useOrganizationProfile(organizationId || null);
    const members = useMembers(organizationId);
    const updateOrganization = useUpdateOrganization(organizationId);
    const transferOwnership = useTransferOwnership(organizationId);
    const leaveOrganization = useLeaveOrganization();
    const archiveOrganization = useArchiveOrganization();

    const [form, setForm] = useState({
        organizationId: "",
        name: "",
        description: "",
        logoUrl: "",
    });
    const [targetUserId, setTargetUserId] = useState("");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);

    const profileForm = profile.data && form.organizationId !== profile.data.id
        ? {
            organizationId: profile.data.id,
            name: profile.data.name,
            description: profile.data.description ?? "",
            logoUrl: profile.data.logoUrl ?? "",
        }
        : form;

    const isAdmin = profile.data?.role === "Admin";
    const isOwner = profile.data?.isOwner ?? false;
    const busy =
        updateOrganization.isPending ||
        transferOwnership.isPending ||
        leaveOrganization.isPending ||
        archiveOrganization.isPending;

    function applySession(session: OrganizationSession) {
        login(session.accessToken, session.expiresAtUtc);
        void queryClient.invalidateQueries();
        navigate(session.organizationId ? "/dashboard" : "/onboarding", {
            replace: true,
        });
    }

    function showError(error: unknown, title: string) {
        const normalized = normalizeError(error, { title });
        toast.error(normalized.title, { description: normalized.description });
    }

    function resetForm() {
        if (!profile.data) return;

        setForm({
            organizationId: profile.data.id,
            name: profile.data.name,
            description: profile.data.description ?? "",
            logoUrl: profile.data.logoUrl ?? "",
        });
    }

    function handleEdit() {
        resetForm();
        setIsEditOpen(true);
    }

    function handleCancelEdit() {
        resetForm();
        setIsEditOpen(false);
    }

    function handleOpenTransfer() {
        setTargetUserId("");
        setIsTransferOpen(true);
    }

    async function handleSave(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!isAdmin) return;

        try {
            await updateOrganization.mutateAsync({
                name: profileForm.name.trim(),
                description: profileForm.description.trim() || null,
                logoUrl: profileForm.logoUrl.trim() || null,
            });

            setIsEditOpen(false);
            toast.success("Organization profile updated.");
        } catch (error) {
            showError(error, "We couldn't update the organization");
        }
    }

    async function handleTransfer() {
        if (!isOwner || !targetUserId) return;

        const target = members.data?.find((member) => member.userId === targetUserId);
        const confirmed = await confirm({
            title: "Transfer ownership?",
            description: `${target?.fullName ?? "This member"} will become the Owner and an Admin. You will remain an Admin.`,
            confirmLabel: "Transfer ownership",
        });

        if (!confirmed) return;

        try {
            const session = await transferOwnership.mutateAsync(targetUserId);
            setIsTransferOpen(false);
            applySession(session);
            toast.success("Ownership transferred.");
        } catch (error) {
            showError(error, "We couldn't transfer ownership");
        }
    }

    async function handleLeave() {
        if (isOwner) return;

        const confirmed = await confirm({
            title: "Leave this organization?",
            description: "You will immediately lose access to this workspace. Your account and other workspaces remain available.",
            confirmLabel: "Leave organization",
            tone: "destructive",
        });

        if (!confirmed) return;

        try {
            const session = await leaveOrganization.mutateAsync(organizationId);
            applySession(session);
            toast.success("You left the organization.");
        } catch (error) {
            showError(error, "We couldn't leave the organization");
        }
    }

    async function handleArchive() {
        const confirmed = await confirm({
            title: "Archive this organization?",
            description: "All members will lose access immediately and pending invitations will be revoked. The Owner can restore it from onboarding, where deletion becomes available afterward.",
            confirmLabel: "Archive organization",
            tone: "destructive",
        });

        if (!confirmed) return;

        try {
            const session = await archiveOrganization.mutateAsync(organizationId);
            applySession(session);
            toast.success("Organization archived.");
        } catch (error) {
            showError(error, "We couldn't archive the organization");
        }
    }

    if (profile.isPending) {
        return <Skeleton className="h-64 w-full rounded-xl" />;
    }

    if (profile.error || !profile.data) {
        return (
            <ErrorState
                error={profile.error}
                title="Organization settings could not be loaded"
                description="Please try again. Your workspace data is safe."
                action={
                    <Button variant="outline" onClick={() => void profile.refetch()}>
                        Retry
                    </Button>
                }
            />
        );
    }

    const transferableMembers = (members.data ?? []).filter(
        (member) => member.userId !== selfId && !member.isOwner
    );

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
                <div className="relative border-b border-border bg-linear-to-br from-primary-subtle/50 via-card to-card px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-card text-primary shadow-sm">
                                <Building2 className="size-6" strokeWidth={1.8} />
                            </span>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="truncate font-heading text-xl font-semibold tracking-[-0.02em] text-foreground">
                                        {profile.data.name}
                                    </h2>
                                    {isOwner && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-warning/20 bg-warning-subtle px-2 py-0.5 text-[11px] font-semibold text-warning-foreground">
                                            <ShieldCheck className="size-3" />
                                            Owner
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-medium">/{profile.data.slug}</span>
                                    <span aria-hidden="true" className="size-1 rounded-full bg-border-strong" />
                                    <span>Your role: {profile.data.role}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {isAdmin && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleEdit}
                                    disabled={busy}
                                >
                                    <Pencil className="size-4" />
                                    Edit
                                </Button>
                            )}
                            {isOwner && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleOpenTransfer}
                                    disabled={busy}
                                >
                                    <ArrowRightLeft className="size-4" />
                                    Transfer ownership
                                </Button>
                            )}
                            {isOwner ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => void handleArchive()}
                                    disabled={busy}
                                    className="border-destructive/25 text-destructive hover:bg-danger-subtle hover:text-danger-foreground"
                                >
                                    {archiveOrganization.isPending ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Archive className="size-4" />
                                    )}
                                    {archiveOrganization.isPending ? "Archiving…" : "Archive organization"}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => void handleLeave()}
                                    disabled={busy}
                                    className="text-destructive hover:bg-danger-subtle hover:text-danger-foreground"
                                >
                                    {leaveOrganization.isPending ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <LogOut className="size-4" />
                                    )}
                                    {leaveOrganization.isPending ? "Leaving…" : "Leave organization"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

            </section>

            <MembersSettings isAdmin={isAdmin} />

            {isAdmin && (
                <Dialog
                    open={isEditOpen}
                    onOpenChange={(open) => {
                        if (!open && !updateOrganization.isPending) {
                            setIsEditOpen(false);
                            resetForm();
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-[560px]">
                        <form onSubmit={handleSave}>
                            <DialogHeader>
                                <DialogTitle>Edit organization profile</DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-4 py-2">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="organization-name">Organization name</Label>
                                        <Input
                                            id="organization-name"
                                            value={profileForm.name}
                                            onChange={(event) => setForm({ ...profileForm, name: event.target.value })}
                                            disabled={busy}
                                            maxLength={150}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="organization-logo">Logo URL</Label>
                                        <Input
                                            id="organization-logo"
                                            type="url"
                                            value={profileForm.logoUrl}
                                            onChange={(event) => setForm({ ...profileForm, logoUrl: event.target.value })}
                                            disabled={busy}
                                            placeholder="https://example.com/logo.png"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-3">
                                        <Label htmlFor="organization-description">Description</Label>
                                        <span className="text-[11px] tabular-nums text-muted-foreground">
                                            {profileForm.description.length}/1000
                                        </span>
                                    </div>
                                    <Textarea
                                        id="organization-description"
                                        value={profileForm.description}
                                        onChange={(event) => setForm({ ...profileForm, description: event.target.value })}
                                        disabled={busy}
                                        rows={4}
                                        maxLength={1000}
                                        placeholder="What is this organization for?"
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    disabled={busy}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={busy || !profileForm.name.trim()}
                                >
                                    {updateOrganization.isPending ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Save className="size-4" />
                                    )}
                                    {updateOrganization.isPending ? "Saving…" : "Save changes"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {isOwner && (
                <Dialog
                    open={isTransferOpen}
                    onOpenChange={(open) => {
                        if (!open && !transferOwnership.isPending) {
                            setIsTransferOpen(false);
                            setTargetUserId("");
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-[440px]">
                        <DialogHeader>
                            <DialogTitle>Transfer ownership</DialogTitle>
                            <DialogDescription>
                                The selected member will become the Owner and an Admin. You will remain an Admin.
                            </DialogDescription>
                        </DialogHeader>

                        {transferableMembers.length > 0 ? (
                            <div className="space-y-2 py-2">
                                <Label htmlFor="ownership-target">New owner</Label>
                                <Select
                                    value={targetUserId}
                                    onValueChange={(value) => setTargetUserId(value ?? "")}
                                >
                                    <SelectTrigger id="ownership-target" className="w-full">
                                        <SelectValue placeholder="Choose a member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {transferableMembers.map((member) => (
                                            <SelectItem key={member.userId} value={member.userId}>
                                                {member.fullName || member.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-border bg-surface-muted/30 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
                                Invite another member before transferring ownership.
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsTransferOpen(false)}
                                disabled={transferOwnership.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={() => void handleTransfer()}
                                disabled={!targetUserId || busy}
                            >
                                {transferOwnership.isPending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <ArrowRightLeft className="size-4" />
                                )}
                                {transferOwnership.isPending ? "Transferring…" : "Transfer ownership"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
