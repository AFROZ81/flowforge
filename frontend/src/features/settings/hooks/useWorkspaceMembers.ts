import { useQuery } from "@tanstack/react-query";

import { membersService } from "../api/members.service";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Who is in this workspace.
 *
 * Membership changes rarely, so a minute of freshness avoids a refetch every
 * time somebody lands on Settings.
 */
export function useWorkspaceMembers() {
    const currentOrganizationId = useAuthStore((state) => state.user?.organizationId);

    return useQuery({
        queryKey: ["workspace", "members", currentOrganizationId],
        queryFn: () => membersService.getMembers(currentOrganizationId ?? ""),
        enabled: !!currentOrganizationId,
        staleTime: 60_000,
    });
}
