import { useQuery } from "@tanstack/react-query";

import { authService } from "../services/auth.service";

/**
 * Workspaces offered on the sign-up face.
 *
 * `enabled` is passed in rather than always-on: the list is only needed once
 * somebody actually flips the card, so a plain visit to /login never asks for
 * it. It changes rarely, so the shared 60s staleTime is plenty.
 */
export function useOrganizationOptions(enabled: boolean) {
    return useQuery({
        queryKey: ["organization-options"],
        queryFn: authService.getOrganizationOptions,
        enabled,
    });
}
