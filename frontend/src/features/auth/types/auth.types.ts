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
    /** The workspace the new account is created in. */
    organizationId: string;
}

export interface RegisterResponse {
    userId: string;
    message: string;
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

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
