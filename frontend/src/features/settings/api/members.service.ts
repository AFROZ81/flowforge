import api from "@/lib/api";

export type UserRole = "Admin" | "Member" | "Viewer";

export type UserRoleNumber = 1 | 2 | 3;

const ROLE_TO_NUMBER: Record<UserRole, UserRoleNumber> = {
    Admin: 1,
    Member: 2,
    Viewer: 3,
};

const NUMBER_TO_ROLE: Record<UserRoleNumber, UserRole> = {
    1: "Admin",
    2: "Member",
    3: "Viewer",
};

function normalizeRole(role: UserRole | UserRoleNumber): UserRoleNumber {
    return typeof role === "number" ? role : ROLE_TO_NUMBER[role];
}

export interface MemberResponse {
    userId: string;
    email: string;
    fullName: string;
    role: UserRole | UserRoleNumber;
    isOwner: boolean;
    joinedAt: string;
    isCurrentUser: boolean;
}

export interface GetMembersResponse {
    userId: string;
    email: string;
    fullName: string;
    role: UserRoleNumber;
    isOwner: boolean;
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

    if (!Array.isArray(data)) {
        return [];
    }

    return (data as MemberResponse[]).map((member) => ({
        ...member,
        role: normalizeRole(member.role),
    }));
}

async function changeMemberRole(
    organizationId: string,
    userId: string,
    role: UserRoleNumber
): Promise<ChangeMemberRoleResponse> {
    const response = await api.put(`/Organizations/${organizationId}/members/${userId}/role`, {
        role: NUMBER_TO_ROLE[role],
    });
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