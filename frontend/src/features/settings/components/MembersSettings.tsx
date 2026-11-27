import { useMemo, useState } from "react";
import {
    ArrowDownWideNarrow,
    Check,
    CircleAlert,
    Clock,
    Loader2,
    Mail,
    MoreHorizontal,
    RefreshCw,
    Search,
    Send,
    ShieldCheck,
    UserPlus,
    UsersRound,
    X,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyStateCard } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { normalizeError } from "@/lib/errors";
import { usePresence } from "@/features/presence";
import { formatDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { isAdminRole } from "@/lib/auth-roles";

import {
    useMemberWorkload,
    type AssigneeSummary,
} from "../hooks/useMemberWorkload";
import {
    useInvitations,
    useCreateInvitation,
    useDeleteInvitation,
    useResendInvitation,
    useMembers,
    useChangeMemberRole,
    useRemoveMember,
} from "../hooks/useInvitations";

type SortKey = "name" | "role";

type SortMode =
    | "name-asc"
    | "name-desc"
    | "role"
    | "workload-desc";

type SortOption = {
    value: SortMode;
    label: string;
    key: SortKey | "workload";
    dir: "asc" | "desc";
};

const SORT_OPTIONS: SortOption[] = [
    { value: "name-asc", label: "Name, A–Z", key: "name", dir: "asc" },
    { value: "name-desc", label: "Name, Z–A", key: "name", dir: "desc" },
    { value: "role", label: "Role", key: "role", dir: "asc" },
    { value: "workload-desc", label: "Most assigned", key: "workload", dir: "desc" },
];

const ROLE_OPTIONS = [
    { value: "Admin", label: "Admin" },
    { value: "Member", label: "Member" },
    { value: "Viewer", label: "Viewer" },
] as const;

const ROLE_ORDER: Record<number, number> = { 1: 0, 2: 1, 3: 2 };

function roleToString(role: number): string {
    switch (role) {
        case 1:
            return "Admin";
        case 2:
            return "Member";
        case 3:
            return "Viewer";
        default:
            return "Member";
    }
}

function roleToNumber(role: string): number {
    switch (role) {
        case "Admin":
            return 1;
        case "Member":
            return 2;
        case "Viewer":
            return 3;
        default:
            return 2;
    }
}

const ROLE_DESCRIPTION: Record<number, string> = {
    1: "Admins can manage workspace settings and members.",
    2: "Members can work across projects and boards.",
    3: "Viewers can only view workspace content.",
};

function RoleBadge({ role }: { role: number }) {
    const roleName = roleToString(role);

    const roleStyles: Record<string, string> = {
        Admin: "bg-destructive/10 text-destructive border-destructive/20",
        Member: "bg-primary/10 text-primary border-primary/20",
        Viewer: "bg-muted text-muted-foreground border-border",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                roleStyles[roleName]
            )}
        >
            {roleName}
        </span>
    );
}

type MemberRow = {
    userId: string;
    email: string;
    fullName: string;
    role: number;
    joinedAt: string;
    isCurrentUser: boolean;
    online: boolean;
    isSelf: boolean;
    work: AssigneeSummary | null;
};

export default function MembersSettings() {
    const workload = useMemberWorkload();
    const { onlineUserIds } = usePresence();
    const selfId = useAuthStore((state) => state.user?.id);
    const currentOrganizationId = useAuthStore(
        (state) => state.user?.organizationId
    );
    const currentUserRole = useAuthStore((state) => state.user?.role);
    const isAdmin = isAdminRole(currentUserRole);

    const invitations = useInvitations(
        isAdmin ? currentOrganizationId ?? "" : ""
    );
    const createInvitation = useCreateInvitation(currentOrganizationId ?? "");
    const deleteInvitation = useDeleteInvitation(currentOrganizationId ?? "");
    const resendInvitation = useResendInvitation(currentOrganizationId ?? "");

    const membersQuery = useMembers(currentOrganizationId ?? "");
    const changeMemberRole = useChangeMemberRole(currentOrganizationId ?? "");
    const removeMember = useRemoveMember(currentOrganizationId ?? "");

    const [search, setSearch] = useState("");
    const [onlineOnly, setOnlineOnly] = useState(false);
    const [roleFilter, setRoleFilter] = useState<"all" | "1" | "2" | "3">(
        "all"
    );
    const [sort, setSort] = useState<SortMode>("name-asc");

    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<
        "Admin" | "Member" | "Viewer" | null
    >("Member");
    const [inviteMessage, setInviteMessage] = useState("");

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<{
        userId: string;
        fullName: string;
        role: number;
    } | null>(null);

    const workloadByUserId = useMemo(() => {
        const map = new Map<string, AssigneeSummary>();

        for (const entry of workload.data ?? []) {
            map.set(entry.userId, entry);
        }

        return map;
    }, [workload.data]);

    const rows = useMemo<MemberRow[]>(() => {
        const query = search.trim().toLowerCase();
        const activeSort =
            SORT_OPTIONS.find((option) => option.value === sort) ??
            SORT_OPTIONS[0];

        return (membersQuery.data ?? [])
            .map((member) => ({
                ...member,
                online: onlineUserIds.includes(member.userId),
                isSelf: member.userId === selfId,
                work: workloadByUserId.get(member.userId) ?? null,
            }))
            .filter((member) => (onlineOnly ? member.online : true))
            .filter((member) =>
                roleFilter === "all"
                    ? true
                    : String(member.role) === roleFilter
            )
            .filter((member) => {
                if (!query) {
                    return true;
                }

                return (
                    member.fullName.toLowerCase().includes(query) ||
                    (member.email ?? "").toLowerCase().includes(query)
                );
            })
            .sort((left, right) => {
                const direction = activeSort.dir === "asc" ? 1 : -1;

                if (activeSort.key === "name") {
                    return (
                        direction *
                        left.fullName.localeCompare(right.fullName, undefined, {
                            sensitivity: "base",
                        })
                    );
                }

                if (activeSort.key === "role") {
                    return (
                        direction *
                        ((ROLE_ORDER[left.role] ?? 9) -
                            (ROLE_ORDER[right.role] ?? 9))
                    );
                }

                const leftValue = left.work?.assigned ?? -1;
                const rightValue = right.work?.assigned ?? -1;

                return direction * (leftValue - rightValue);
            });
    }, [membersQuery.data, workloadByUserId, onlineUserIds, selfId, search, onlineOnly, roleFilter, sort]);

    const onlineCount = (membersQuery.data ?? []).filter((member) =>
        onlineUserIds.includes(member.userId)
    ).length;

    const workloadFailed = Boolean(workload.error);
    const pendingInvitations = (invitations.data ?? []).filter(
        (invitation) =>
            !invitation.isAccepted &&
            Date.parse(invitation.expiresAt) > invitations.dataUpdatedAt
    );

    const handleInviteSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!isAdmin) return;

        if (!inviteEmail.trim()) {
            toast.error("Email is required");
            return;
        }

        const normalizedEmail = inviteEmail.trim().toLowerCase();
        const alreadyPending = pendingInvitations.some(
            (invitation) =>
                invitation.email.trim().toLowerCase() === normalizedEmail
        );

        if (alreadyPending) {
            void invitations.refetch();
            toast.error("Invitation already pending", {
                description:
                    "An invitation for this email already exists in the pending invitations list below. You can resend it from there.",
            });
            return;
        }

        try {
            const response = await createInvitation.mutateAsync({
                email: normalizedEmail,
                role: inviteRole ?? "Member",
                message: inviteMessage.trim() || undefined,
                organizationId: currentOrganizationId ?? "",
            });

            if (response.emailStatus === "Failed") {
                toast.warning("Invitation created, but email was not sent", {
                    description:
                        response.emailError ??
                        "Use Resend in the pending invitations list to retry delivery.",
                });
            } else {
                toast.success("Invitation sent successfully");
            }

            setIsInviteDialogOpen(false);
            setInviteEmail("");
            setInviteMessage("");
            setInviteRole("Member");
        } catch (error) {
            const { status, title, description } = normalizeError(error, {
                title: "Invitation could not be sent",
            });

            if (status === 409) {
                void invitations.refetch();
            }

            if (
                status === 409 &&
                /pending invitation/i.test(description)
            ) {
                toast.error("Invitation already pending", {
                    description:
                        "An invitation for this email already exists in the pending invitations list below. You can resend it from there.",
                });
            } else {
                toast.error(title, { description });
            }
        }
    };

    const handleRevoke = async (invitationId: string) => {
        if (!isAdmin) return;

        if (!confirm("Are you sure you want to revoke this invitation?")) {
            return;
        }

        try {
            await deleteInvitation.mutateAsync(invitationId);
            toast.success("Invitation revoked");
        } catch {
            toast.error("Failed to revoke invitation");
        }
    };

    const handleResend = async (invitationId: string) => {
        if (!isAdmin) return;

        try {
            await resendInvitation.mutateAsync(invitationId);
            toast.success("Invitation resent");
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: "Invitation could not be resent",
            });
            toast.error(title, { description });
        }
    };

    const totalMembers = membersQuery.data?.length ?? 0;
    const isFiltering =
        search.trim().length > 0 || onlineOnly || roleFilter !== "all";

    if (membersQuery.isPending) {
        return <MembersSkeleton />;
    }

    if (membersQuery.error) {
        return (
            <ErrorState
                error={membersQuery.error}
                title="The roster could not be loaded"
                description="Please try again. Your workspace data is safe."
                action={
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            void membersQuery.refetch();
                            void workload.refetch();
                        }}
                    >
                        <RefreshCw />
                        Retry
                    </Button>
                }
            />
        );
    }

    return (
        <div className="space-y-5">
            {/* ---------------- Header ---------------- */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <div className="min-w-0">
                    <h2 className="font-heading text-lg font-semibold tracking-[-0.01em] text-foreground">
                        Members
                    </h2>
                    <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                        {formatNumber(totalMembers)}{" "}
                        {totalMembers === 1 ? "member" : "members"}
                        {"  ·  "}
                        <span className="inline-flex items-center gap-1.5">
                            <span
                                aria-hidden="true"
                                className="size-1.5 rounded-full bg-success"
                            />
                            {formatNumber(onlineCount)} online
                        </span>
                        {isFiltering ? (
                            <>
                                {"  ·  "}
                                showing {formatNumber(rows.length)}
                            </>
                        ) : null}
                    </p>
                </div>

                {isAdmin ? (
                <Dialog
                    open={isInviteDialogOpen}
                    onOpenChange={setIsInviteDialogOpen}
                >
                    <DialogTrigger
                        render={
                            <Button type="button">
                                <UserPlus />
                                Invite member
                            </Button>
                        }
                    />
                    <DialogContent className="sm:max-w-[440px]">
                        <form onSubmit={handleInviteSubmit}>
                            <DialogHeader>
                                <DialogTitle>Invite team member</DialogTitle>
                                <DialogDescription>
                                    Enter the email address of the person you'd
                                    like to invite.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="invite-email">Email</Label>
                                    <Input
                                        id="invite-email"
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) =>
                                            setInviteEmail(e.target.value)
                                        }
                                        placeholder="colleague@example.com"
                                        required
                                        disabled={createInvitation.isPending}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="invite-role">Role</Label>
                                    <Select
                                        value={inviteRole ?? "Member"}
                                        onValueChange={(value) =>
                                            setInviteRole(
                                                value as
                                                    | "Admin"
                                                    | "Member"
                                                    | "Viewer"
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            id="invite-role"
                                            className="w-full"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ROLE_OPTIONS.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="invite-message">
                                        Personal message
                                    </Label>
                                    <Textarea
                                        id="invite-message"
                                        value={inviteMessage}
                                        onChange={(e) =>
                                            setInviteMessage(e.target.value)
                                        }
                                        placeholder="Add a personal note..."
                                        rows={3}
                                        disabled={createInvitation.isPending}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setIsInviteDialogOpen(false)
                                    }
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        createInvitation.isPending ||
                                        !inviteEmail.trim()
                                    }
                                >
                                    {createInvitation.isPending ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            Sending…
                                        </>
                                    ) : (
                                        <>
                                            <Send />
                                            Send invitation
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                ) : null}
            </div>

            {/* ---------------- Edit role dialog ---------------- */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>Edit member role</DialogTitle>
                        <DialogDescription>
                            Update this member's permissions in the workspace.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 py-1">
                        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted/55 px-3.5 py-3">
                            <Avatar name={editingMember?.fullName} size="md" />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {editingMember?.fullName}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Workspace member
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="edit-role"
                                className="text-sm font-medium"
                            >
                                Role
                            </Label>
                            <Select
                                value={roleToString(editingMember?.role ?? 2)}
                                onValueChange={(value) => {
                                    setEditingMember((current) =>
                                        current
                                            ? {
                                                  ...current,
                                                  role: roleToNumber(
                                                      value ?? "Member"
                                                  ),
                                              }
                                            : current
                                    );
                                }}
                            >
                                <SelectTrigger
                                    id="edit-role"
                                    className="h-11 w-full px-3 font-medium"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLE_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                {ROLE_DESCRIPTION[editingMember?.role ?? 2]}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="sm:pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                if (!editingMember) return;
                                changeMemberRole.mutate({
                                    userId: editingMember.userId,
                                    role: editingMember.role,
                                });
                                setIsEditDialogOpen(false);
                            }}
                            disabled={changeMemberRole.isPending}
                        >
                            {changeMemberRole.isPending ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <Check />
                                    Save role
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ---------------- Workload warning ---------------- */}
            {workloadFailed ? (
                <div
                    role="alert"
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                >
                    <CircleAlert className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1">
                        Workload figures could not be loaded. The roster below is
                        still current.
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void workload.refetch()}
                    >
                        Retry
                    </Button>
                </div>
            ) : null}

            {isAdmin && invitations.error ? (
                <div
                    role="alert"
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                >
                    <CircleAlert className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1">
                        Pending invitations could not be loaded. Existing invitations may not appear below.
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void invitations.refetch()}
                    >
                        <RefreshCw />
                        Retry
                    </Button>
                </div>
            ) : null}

            {/* ---------------- Toolbar ---------------- */}
            {totalMembers > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full min-w-0 sm:w-auto sm:flex-none">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search members"
                            aria-label="Search members"
                            className="h-9 w-full rounded-lg pr-8 pl-9 sm:w-72"
                        />
                        {search ? (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                                className="absolute top-1/2 right-2 grid size-5 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <X className="size-3.5" />
                            </button>
                        ) : null}
                    </div>

                    <label className="relative inline-flex items-center">
                        <span className="sr-only">Filter by role</span>
                        <ShieldCheck
                            aria-hidden="true"
                            className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground"
                        />
                        <select
                            value={roleFilter}
                            onChange={(event) =>
                                setRoleFilter(event.target.value as
                                    | "all"
                                    | "1"
                                    | "2"
                                    | "3")
                            }
                            className={cn(
                                "h-9 cursor-pointer appearance-none rounded-lg border border-input bg-card pr-8 pl-8 text-[13px] font-medium text-foreground",
                                "outline-none transition-colors hover:border-border-strong",
                                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35"
                            )}
                        >
                            <option value="all">All roles</option>
                            <option value="1">Admins</option>
                            <option value="2">Members</option>
                            <option value="3">Viewers</option>
                        </select>
                    </label>

                    <label className="relative inline-flex items-center">
                        <span className="sr-only">Sort members</span>
                        <ArrowDownWideNarrow
                            aria-hidden="true"
                            className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground"
                        />
                        <select
                            value={sort}
                            onChange={(event) =>
                                setSort(event.target.value as SortMode)
                            }
                            className={cn(
                                "h-9 cursor-pointer appearance-none rounded-lg border border-input bg-card pr-8 pl-8 text-[13px] font-medium text-foreground",
                                "outline-none transition-colors hover:border-border-strong",
                                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35"
                            )}
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <button
                        type="button"
                        aria-pressed={onlineOnly}
                        onClick={() => setOnlineOnly((current) => !current)}
                        className={cn(
                            "flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium",
                            "outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                            onlineOnly
                                ? "border-success bg-success-subtle text-success"
                                : "border-input bg-card text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className={cn(
                                "size-2.5 rounded-full",
                                onlineOnly ? "bg-success" : "bg-border-strong"
                            )}
                        />
                        Online only
                    </button>
                </div>
            ) : null}

            {/* ---------------- Pending invitations ---------------- */}
            {isAdmin && pendingInvitations.length > 0 ? (
                <PendingInvitations
                    invitations={pendingInvitations}
                    onResend={handleResend}
                    onRevoke={handleRevoke}
                    resending={resendInvitation.isPending}
                    revoking={deleteInvitation.isPending}
                />
            ) : null}

            {/* ---------------- Roster ---------------- */}
            {totalMembers > 0 ? (
                <section
                    className="space-y-3"
                    aria-labelledby="existing-members-heading"
                >
                    <div className="flex items-center gap-2">
                        <h3
                            id="existing-members-heading"
                            className="text-sm font-semibold text-foreground"
                        >
                            Existing members
                        </h3>
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary-subtle px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-primary">
                            {formatNumber(rows.length)}
                        </span>
                    </div>

                    {rows.length === 0 ? (
                        <EmptyStateCard
                            icon={UsersRound}
                            tone={isFiltering ? "neutral" : "brand"}
                            title={
                                isFiltering
                                    ? "No matching members"
                                    : "No members yet"
                            }
                            description={
                                isFiltering
                                    ? "No member matches the current filter. Try clearing it."
                                    : "Invite your first teammate to start collaborating."
                            }
                            action={
                                isFiltering ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearch("");
                                            setOnlineOnly(false);
                                            setRoleFilter("all");
                                        }}
                                    >
                                        Clear filters
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() =>
                                            setIsInviteDialogOpen(true)
                                        }
                                    >
                                        <UserPlus />
                                        Invite member
                                    </Button>
                                )
                            }
                        />
                    ) : (
                        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {rows.map((row) => (
                                <MemberCard
                                    key={row.userId}
                                    row={row}
                                    isAdmin={isAdmin}
                                    onEdit={() => {
                                        setEditingMember({
                                            userId: row.userId,
                                            fullName: row.fullName,
                                            role: row.role ?? 2,
                                });
                                setIsEditDialogOpen(true);
                            }}
                            onRemove={() => {
                                if (
                                    confirm(
                                        "Are you sure you want to remove this member?"
                                    )
                                ) {
                                    removeMember.mutate(row.userId);
                                }
                            }}
                            changingRole={changeMemberRole.isPending}
                            removing={removeMember.isPending}
                        />
                    ))}
                        </ul>
                    )}
                </section>
            ) : null}
        </div>
    );
}

/* =========================================================
   MEMBER CARD
   The avatar + presence is the hero; name, role and workload
   support it. Actions surface on hover / focus and are always
   in the tab order.
   ========================================================= */

function MemberCard({
    row,
    isAdmin,
    onEdit,
    onRemove,
    changingRole,
    removing,
}: {
    row: MemberRow;
    isAdmin: boolean;
    onEdit: () => void;
    onRemove: () => void;
    changingRole: boolean;
    removing: boolean;
}) {
    const assigned = row.work?.assigned ?? 0;
    const active = row.work?.active ?? 0;

    return (
        <li
            className={cn(
                "group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs",
                "transition-all duration-(--transition-fast)",
                "hover:border-border-strong hover:shadow-sm",
                "focus-within:border-border-strong"
            )}
        >
            <div className="flex items-start gap-3">
                <Avatar
                    name={row.fullName}
                    size="md"
                    ring
                    indicator={
                        <span
                            aria-hidden="true"
                            className={cn(
                                "grid size-3.5 place-items-center rounded-full ring-2 ring-card",
                                row.online ? "bg-success" : "bg-border-strong"
                            )}
                        />
                    }
                />

                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-1.5">
                                <h3 className="min-w-0 truncate text-sm font-semibold text-foreground">
                                    {row.fullName}
                                </h3>
                                {row.isSelf ? (
                                    <span className="shrink-0 rounded-full border border-border px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                        You
                                    </span>
                                ) : null}
                            </div>
                            {row.email ? (
                                <a
                                    href={`mailto:${row.email}`}
                                    className="mt-0.5 block truncate text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                                >
                                    {row.email}
                                </a>
                            ) : (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    No email
                                </p>
                            )}
                        </div>

                        {/* Actions: always in the tab order, visually quiet
                            until the card is hovered or holds focus. */}
                        {isAdmin && !row.isSelf ? (
                            <div
                                className={cn(
                                    "flex shrink-0 items-center gap-0.5 transition-opacity",
                                    "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                                )}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={onEdit}
                                    disabled={changingRole}
                                    aria-label={`Edit ${row.fullName}`}
                                    title="Edit role"
                                >
                                    <MoreHorizontal />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={onRemove}
                                    disabled={removing}
                                    aria-label={`Remove ${row.fullName}`}
                                    title="Remove member"
                                    className="text-muted-foreground hover:bg-danger-subtle hover:text-danger-foreground"
                                >
                                    {removing ? (
                                        <span
                                            aria-hidden="true"
                                            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                                        />
                                    ) : (
                                        <X />
                                    )}
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                <RoleBadge role={row.role} />

                <div className="flex items-center gap-3 text-xs tabular-nums">
                    <span
                        className="inline-flex items-center gap-1 text-muted-foreground"
                        title={`${assigned} assigned`}
                    >
                        <span className="font-semibold text-foreground">
                            {formatNumber(assigned)}
                        </span>
                        assigned
                    </span>
                    {active > 0 ? (
                        <span
                            className="inline-flex items-center gap-1 text-muted-foreground"
                            title={`${active} active`}
                        >
                            <span className="size-1.5 rounded-full bg-success" />
                            {formatNumber(active)}
                        </span>
                    ) : null}
                </div>
            </div>
        </li>
    );
}

/* =========================================================
   PENDING INVITATIONS
   ========================================================= */

function PendingInvitations({
    invitations,
    onResend,
    onRevoke,
    resending,
    revoking,
}: {
    invitations: {
        id: string;
        email: string;
        role: string;
        expiresAt: string;
        emailStatus?: "NotSent" | "Sent" | "Failed";
        emailError?: string;
    }[];
    onResend: (id: string) => void;
    onRevoke: (id: string) => void;
    resending: boolean;
    revoking: boolean;
}) {
    return (
        <section
            className="space-y-3"
            aria-labelledby="pending-invitations-heading"
        >
            <div className="flex items-center gap-2">
                <h3
                    id="pending-invitations-heading"
                    className="text-sm font-semibold text-foreground"
                >
                    Pending invitations
                </h3>
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-warning-subtle px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-warning-foreground">
                    {formatNumber(invitations.length)}
                </span>
            </div>

            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {invitations.map((invitation) => (
                    <li
                        key={invitation.id}
                        className="flex flex-col gap-3 rounded-xl border border-dashed border-border bg-card/60 p-4"
                    >
                        <div className="flex items-start gap-3">
                            <span
                                aria-hidden="true"
                                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface-muted text-muted-foreground"
                            >
                                <Mail className="size-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                    {invitation.email}
                                </p>
                                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="size-3" />
                                    Expires{" "}
                                    {formatDate(invitation.expiresAt, "short")}
                                </p>
                                {invitation.emailError && (
                                    <p className="mt-1 text-xs text-destructive">
                                        {invitation.emailError}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <RoleBadge role={roleToNumber(invitation.role)} />
                                {invitation.emailStatus === "Failed" && (
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/5 px-2 py-0.5 text-xs text-destructive">
                                        <CircleAlert className="size-3" />
                                        Email failed
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onResend(invitation.id)}
                                    disabled={resending}
                                    aria-label="Resend invitation"
                                >
                                    {resending ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <Send />
                                    )}
                                    Resend
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRevoke(invitation.id)}
                                    disabled={revoking}
                                    className="text-muted-foreground hover:bg-danger-subtle hover:text-danger-foreground"
                                    aria-label="Revoke invitation"
                                >
                                    <X />
                                    Revoke
                                </Button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

/* =========================================================
   SKELETON
   ========================================================= */

function MembersSkeleton() {
    return (
        <div
            role="status"
            aria-label="Loading members"
            className="space-y-5"
        >
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-9 w-36 rounded-lg" />
            </div>

            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-9 w-full rounded-lg sm:w-72" />
                <Skeleton className="h-9 w-28 rounded-lg" />
                <Skeleton className="h-9 w-32 rounded-lg" />
                <Skeleton className="h-9 w-28 rounded-lg" />
            </div>

            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <li
                        key={index}
                        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs"
                    >
                        <div className="flex items-start gap-3">
                            <Skeleton className="size-9 rounded-full" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <Skeleton className="h-3.5 w-2/3" />
                                <Skeleton className="h-3 w-3/4 opacity-70" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-3.5 w-24 opacity-70" />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}