import api from "@/lib/api";

import type {
    ApiResponse,
    CreateOrganizationRequest,
    CreateOrganizationResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
} from "../types/auth.types";

export const authService = {
    async login(request: LoginRequest) {
        const response = await api.post<ApiResponse<LoginResponse>>(
            "/Auth/login",
            request
        );

        return response.data;
    },

    async register(request: RegisterRequest) {
        const response = await api.post<ApiResponse<RegisterResponse>>(
            "/Auth/register",
            request
        );

        return response.data;
    },

    /**
     * Creates a workspace for the authenticated account and returns its
     * organization session.
     */
    async createOrganization(input: CreateOrganizationRequest) {
        const response = await api.post<CreateOrganizationResponse>(
            "/Organizations",
            input
        );

        // 201 with the bare CreateOrganizationResponse — this endpoint
        // predates the envelope, like the options list above.
        return response.data;
    },
};
