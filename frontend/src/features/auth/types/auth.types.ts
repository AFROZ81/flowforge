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
    /** The workspace the new account is created in. Not used for invitation registration. */
    organizationId?: string;
    invitationToken?: string;
}

export interface RegisterResponse {
    userId: string;
    message: string;
    accessToken?: string;
    expiresAtUtc?: string;
}

/**
 * A workspace offered on the sign-up form. Mirrors the backend
 * `OrganizationOption`, which is the deliberately narrow public shape.
 */
export interface OrganizationOption {
    id: string;
    name: string;
    slug: string;
}

/**
 * Body for `POST /api/Organizations`. Only used to bootstrap the very first
 * workspace, so `description` is never sent — the person filling the form has
 * not got a workspace yet, let alone one to describe.
 */
export interface CreateOrganizationRequest {
    name: string;
    slug: string;
}

/** Mirrors the backend `CreateOrganizationResponse`, returned bare. */
export interface CreateOrganizationResponse {
    id: string;
    name: string;
    slug: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
