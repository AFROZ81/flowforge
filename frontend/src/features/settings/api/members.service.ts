import api from "@/lib/api";

export type UserRole = "Admin" | "Member" | "Viewer";

export type UserRoleNumber = 1 | 2 | 3;

export interface MemberResponse {
    userId: string;
    email: string;
    fullName: string;
    role: UserRole;
    joinedAt: string;
    isCurrentUser: boolean;
}

export interface GetMembersResponse {
    userId: string;
    email: string;
    fullName: string;
    role: UserRoleNumber;
    joinedAt: string;
    isCurrentUser: boolean;
}

export interface ChangeMemberRoleRequest {
    role: UserRole;
}

export interface ChangeMemberRoleResponse {
    userId: string;
    role: UserRole;
    updatedAt: string;
}

async function getMembers(organizationId: string): Promise<GetMembersResponse[]> {
    const response = await api.get(`/Organizations/${organizationId}/members`);
    const data = response.data;

    return Array.isArray(data) ? (data as GetMembersResponse[]) : [];
}

async function changeMemberRole(
    organizationId: string,
    userId: string,
    role: UserRoleNumber
): Promise<ChangeMemberRoleResponse> {
    const response = await api.put(`/Organizations/${organizationId}/members/${userId}/role`, { role });
    const data = response.data;

    if (!data) {
        throw new Error("Failed to change member role");
    }

    return data as ChangeMemberRoleResponse;
}

async function removeMember(organizationId: string, userId: string): Promise<void> {
    await api.delete(`/Organizations/${organizationId}/members/${userId}`);
}

export const membersService = {
    getMembers,
    changeMemberRole,
    removeMember,
};