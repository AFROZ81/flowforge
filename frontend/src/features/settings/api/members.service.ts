import api from "@/lib/api";

export interface WorkspaceMember {
    id: string;
    fullName: string;
    email: string | null;
}

/**
 * The people in this workspace.
 *
 * `GET /api/Users` takes no identifier: the handler reads the organization from
 * the caller's token, so a client cannot ask for somebody else's workspace. The
 * endpoint answers inside the application's `{ success, message, data }`
 * envelope, and a missing list is treated as empty rather than thrown at.
 */
async function getOrganizationUsers(): Promise<WorkspaceMember[]> {
    const response = await api.get("/Users");
    const data = response.data?.data;

    return Array.isArray(data) ? (data as WorkspaceMember[]) : [];
}

export const membersService = {
    getOrganizationUsers,
};
