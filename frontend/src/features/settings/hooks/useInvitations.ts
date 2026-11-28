import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { invitationsService } from "../api/invitations.service";
import type { CreateInvitationRequest, GetInvitationsResponse } from "../api/invitations.service";
import type { InvitationDetailsResponse } from "../api/invitations.service";
import { membersService } from "../api/members.service";
import type { GetMembersResponse, UserRoleNumber } from "../api/members.service";

export function useInvitations(organizationId: string) {
    return useQuery<GetInvitationsResponse[]>({
        queryKey: ["organization", organizationId, "invitations"],
        queryFn: invitationsService.getInvitations,
        enabled: !!organizationId,
        staleTime: 30_000,
    });
}

export function useCreateInvitation(organizationId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateInvitationRequest) => invitationsService.createInvitation(request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["organization", organizationId, "invitations"] });
        },
    });
}

export function useDeleteInvitation(organizationId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => invitationsService.deleteInvitation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["organization", organizationId, "invitations"] });
        },
    });
}

export function useResendInvitation(organizationId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => invitationsService.resendInvitation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["organization", organizationId, "invitations"] });
        },
    });
}

export function useAcceptInvitation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (token: string) => invitationsService.acceptInvitation(token),
        onSuccess: (_, variables) => {
            void queryClient.invalidateQueries({ queryKey: ["invitation", variables] });
            void queryClient.invalidateQueries({ queryKey: ["organizations", "mine"] });
        },
    });
}

export function useInvitationDetails(token: string) {
    return useQuery<InvitationDetailsResponse>({
        queryKey: ["invitation", token],
        queryFn: () => invitationsService.getInvitationDetails(token),
        enabled: !!token,
        staleTime: 5 * 60_000,
    });
}

export function useMembers(organizationId: string) {
    return useQuery<GetMembersResponse[]>({
        queryKey: ["organization", organizationId, "members"],
        queryFn: () => membersService.getMembers(organizationId),
        enabled: !!organizationId,
        staleTime: 30_000,
    });
}

export function useChangeMemberRole(organizationId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: number }) =>
            membersService.changeMemberRole(organizationId, userId, role as UserRoleNumber),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["organization", organizationId, "members"] });
        },
    });
}

export function useRemoveMember(organizationId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => membersService.removeMember(organizationId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["organization", organizationId, "members"] });
        },
    });
}