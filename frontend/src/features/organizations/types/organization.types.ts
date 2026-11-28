export type OrganizationRole = "Admin" | "Member" | "Viewer";

export interface OrganizationMembership {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    role: OrganizationRole;
    isActive: boolean;
    isOwner: boolean;
}

export interface OrganizationProfile extends OrganizationMembership {
    description: string | null;
}

export interface OrganizationSession {
    accessToken: string;
    expiresAtUtc: string;
    organizationId: string | null;
}

export interface UpdateOrganizationRequest {
    name: string;
    description: string | null;
    logoUrl: string | null;
}
