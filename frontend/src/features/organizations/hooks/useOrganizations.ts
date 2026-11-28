import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { organizationService } from "../services/organization.service";

const mineKey = ["organizations", "mine"] as const;

export function useMyOrganizations(enabled = true) {
    return useQuery({
        queryKey: mineKey,
        queryFn: organizationService.getMine,
        enabled,
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
    });
}

export function useOrganizationProfile(organizationId: string | null) {
    return useQuery({
        queryKey: ["organizations", organizationId, "profile"],
        queryFn: () => organizationService.getProfile(organizationId!),
        enabled: Boolean(organizationId),
    });
}

export function useCreateOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: organizationService.create,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: mineKey });
        },
    });
}

export function useSwitchOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: organizationService.switch,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: mineKey });
        },
    });
}

export function useUpdateOrganization(organizationId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: Parameters<typeof organizationService.update>[1]) =>
            organizationService.update(organizationId, request),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: mineKey });
            void queryClient.invalidateQueries({
                queryKey: ["organizations", organizationId, "profile"],
            });
        },
    });
}

export function useLeaveOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: organizationService.leave,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: mineKey });
        },
    });
}

export function useTransferOwnership(organizationId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (targetUserId: string) =>
            organizationService.transferOwnership(organizationId, targetUserId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: mineKey });
            void queryClient.invalidateQueries({
                queryKey: ["organization", organizationId, "members"],
            });
        },
    });
}

export function useArchiveOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: organizationService.archive,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: mineKey });
        },
    });
}

export function useRestoreOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: organizationService.restore,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: mineKey });
        },
    });
}

export function useDeleteOrganization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            organizationId,
            confirmationSlug,
        }: {
            organizationId: string;
            confirmationSlug: string;
        }) => organizationService.deleteOrganization(organizationId, confirmationSlug),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: mineKey });
        },
    });
}
