import { useQuery } from "@tanstack/react-query";

import { membersService } from "../api/members.service";

/**
 * Who is in this workspace.
 *
 * Membership changes rarely, so a minute of freshness avoids a refetch every
 * time somebody lands on Settings.
 */
export function useWorkspaceMembers() {
    return useQuery({
        queryKey: ["workspace", "members"],
        queryFn: membersService.getOrganizationUsers,
        staleTime: 60_000,
    });
}
