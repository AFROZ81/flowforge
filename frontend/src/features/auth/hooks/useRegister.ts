import { useMutation } from "@tanstack/react-query";

import { authService } from "../services/auth.service";

import type {
    ApiResponse,
    RegisterRequest,
    RegisterResponse,
} from "../types/auth.types";

/**
 * Registration returns an account-only or invitation session. The caller writes
 * it to the auth store and routes to onboarding or the accepted workspace.
 */
export function useRegister() {
    return useMutation<
        ApiResponse<RegisterResponse>,
        Error,
        RegisterRequest
    >({
        mutationFn: authService.register,
    });
}
