export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    expiresAtUtc: string;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    invitationToken?: string;
}

export interface RegisterResponse {
    userId: string;
    message: string;
    accessToken?: string;
    expiresAtUtc?: string;
}

export interface CreateOrganizationRequest {
    name: string;
    slug: string;
}

export interface CreateOrganizationResponse {
    id: string;
    name: string;
    slug: string;
    accessToken: string;
    expiresAtUtc: string;
    organizationId: string | null;
}

export interface OrganizationSessionResponse {
    accessToken: string;
    expiresAtUtc: string;
    organizationId: string | null;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
