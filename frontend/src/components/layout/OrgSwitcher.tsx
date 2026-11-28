import { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
    Building2,
    Check,
    ChevronDown,
    Loader2,
    Plus,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { normalizeError } from "@/lib/errors";
import { useAuthStore } from "@/stores/auth.store";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import CreateOrganizationForm from "@/features/organizations/components/CreateOrganizationForm";
import { useMyOrganizations } from "@/features/organizations/hooks/useOrganizations";

export default function OrgSwitcher() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, login, switchOrganization } = useAuthStore();
    const organizations = useMyOrganizations();
    const [createOpen, setCreateOpen] = useState(false);

    const current = organizations.data?.find(
        (organization) => organization.id === user?.organizationId
    );
    const active = organizations.data?.filter(
        (organization) => organization.isActive
    ) ?? [];

    async function handleSwitch(organizationId: string) {
        if (organizationId === user?.organizationId) return;

        try {
            await switchOrganization(organizationId);
            await queryClient.invalidateQueries();
            navigate("/dashboard");
        } catch (error) {
            const { title, description } = normalizeError(error, {
                title: "We couldn't switch workspaces",
            });

            toast.error(title, { description });
        }
    }

    function handleCreated(session: {
        accessToken: string;
        expiresAtUtc: string;
        organizationId: string | null;
    }) {
        login(session.accessToken, session.expiresAtUtc);
        setCreateOpen(false);
        void queryClient.invalidateQueries();
        navigate("/dashboard");
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="outline"
                            size="sm"
                            className="min-w-[140px] justify-between gap-1.5"
                            disabled={organizations.isLoading}
                        />
                    }
                >
                    {organizations.isLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Building2 className="size-4 shrink-0" />
                    )}
                    <span className="truncate text-sm font-medium">
                        {current?.name ?? "Workspace"}
                    </span>
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="min-w-[220px]">
                    {active.map((organization) => (
                        <DropdownMenuItem
                            key={organization.id}
                            onSelect={() => void handleSwitch(organization.id)}
                            className="gap-2"
                        >
                            <Building2 className="size-4 shrink-0" />
                            <span className="min-w-0 flex-1 truncate">
                                {organization.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                {organization.role}
                            </span>
                            {organization.id === user?.organizationId && (
                                <Check className="size-4 shrink-0 text-primary" />
                            )}
                        </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onSelect={() => setCreateOpen(true)}>
                        <Plus className="size-4" />
                        Create workspace
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a workspace</DialogTitle>
                        <DialogDescription>
                            Create a separate organization for another team or project. You become its Owner and first Admin.
                        </DialogDescription>
                    </DialogHeader>
                    <CreateOrganizationForm onCreated={handleCreated} />
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setCreateOpen(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
