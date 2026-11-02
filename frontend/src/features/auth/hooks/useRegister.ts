import { useMutation } from "@tanstack/react-query";

import { authService } from "../services/auth.service";

import type {
    ApiResponse,
    RegisterRequest,
    RegisterResponse,
} from "../types/auth.types";

/**
 * Creating an account deliberately does not sign anyone in — the endpoint
 * returns an id, not a token — so there is no store write and no navigation
 * here. The caller flips the card back to sign-in on success.
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
