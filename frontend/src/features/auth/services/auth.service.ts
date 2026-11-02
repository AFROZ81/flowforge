import api from "@/lib/api";

import type {
    ApiResponse,
    LoginRequest,
    LoginResponse,
    OrganizationOption,
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
     * Workspaces a new account may join.
     *
     * This returns a bare array rather than the usual ApiResponse envelope,
     * matching how OrganizationsController is already written — the create
     * action returns its response object directly.
     */
    async getOrganizationOptions() {
        const response = await api.get<OrganizationOption[]>(
            "/Organizations/options"
        );

        return response.data;
    },
};
