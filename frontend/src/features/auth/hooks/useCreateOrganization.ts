import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authService } from "../services/auth.service";

import type {
    CreateOrganizationRequest,
    CreateOrganizationResponse,
} from "../types/auth.types";

/**
 * Creates the first workspace, immediately before the account that lives in it.
 *
 * Success invalidates the option list deliberately. The two calls are not one
 * transaction: if this lands and the registration afterwards does not — an
 * email that is already taken, say — the workspace is real, and the next
 * attempt should offer it in the dropdown instead of creating a second one.
 * An empty workspace left behind that way is inert; it has no projects, no
 * members and no way to be noticed until someone joins it.
 */
export function useCreateOrganization() {
    const queryClient = useQueryClient();

    return useMutation<
        CreateOrganizationResponse,
        Error,
        CreateOrganizationRequest
    >({
        mutationFn: authService.createOrganization,
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ["organization-options"],
            });
        },
    });
}
