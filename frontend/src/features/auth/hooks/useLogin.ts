import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { authService } from "../services/auth.service";

import type {
    ApiResponse,
    LoginRequest,
    LoginResponse,
} from "../types/auth.types";

import { useAuthStore } from "@/stores/auth.store";

export function useLogin() {
    const navigate = useNavigate();

    const loginStore = useAuthStore((state) => state.login);

    return useMutation<
        ApiResponse<LoginResponse>,
        Error,
        LoginRequest
    >({
        mutationFn: authService.login,

        onSuccess(response) {
            loginStore(
                response.data.accessToken,
                response.data.expiresAtUtc
            );

            navigate("/dashboard");
        },
    });
}