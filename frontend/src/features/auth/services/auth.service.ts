import api from "@/lib/api";

import type {
    ApiResponse,
    LoginRequest,
    LoginResponse,
} from "../types/auth.types";

export const authService = {
    async login(request: LoginRequest) {
        const response = await api.post<ApiResponse<LoginResponse>>(
            "/Auth/login",
            request
        );

        return response.data;
    },
};