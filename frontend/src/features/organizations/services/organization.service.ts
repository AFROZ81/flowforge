import api from "@/lib/api";

import type {
    OrganizationMembership,
    OrganizationProfile,
    OrganizationSession,
    UpdateOrganizationRequest,
} from "../types/organization.types";

export const organizationService = {
    async getMine(): Promise<OrganizationMembership[]> {
        const response = await api.get<OrganizationMembership[]>("/Organizations/mine");
        return response.data;
    },

    async create(input: { name: string; slug: string }) {
        const response = await api.post<{
            id: string;
            name: string;
            slug: string;
            accessToken: string;
            expiresAtUtc: string;
            organizationId: string | null;
        }>("/Organizations", input);

        return response.data;
    },

    async switch(organizationId: string): Promise<OrganizationSession> {
        const response = await api.post<OrganizationSession>("/Organizations/switch", {
            organizationId,
        });

        return response.data;
    },

    async getProfile(organizationId: string): Promise<OrganizationProfile> {
        const response = await api.get<OrganizationProfile>(`/Organizations/${organizationId}`);
        return response.data;
    },

    async update(
        organizationId: string,
        request: UpdateOrganizationRequest
    ): Promise<OrganizationProfile> {
        const response = await api.put<OrganizationProfile>(
            `/Organizations/${organizationId}`,
            request
        );

        return response.data;
    },

    async leave(organizationId: string): Promise<OrganizationSession> {
        const response = await api.post<OrganizationSession>(
            `/Organizations/${organizationId}/leave`
        );

        return response.data;
    },

    async transferOwnership(
        organizationId: string,
        targetUserId: string
    ): Promise<OrganizationSession> {
        const response = await api.post<OrganizationSession>(
            `/Organizations/${organizationId}/transfer-ownership`,
            { targetUserId }
        );

        return response.data;
    },

    async archive(organizationId: string): Promise<OrganizationSession> {
        const response = await api.post<OrganizationSession>(
            `/Organizations/${organizationId}/archive`
        );

        return response.data;
    },

    async restore(organizationId: string): Promise<OrganizationSession> {
        const response = await api.post<OrganizationSession>(
            `/Organizations/${organizationId}/restore`
        );

        return response.data;
    },

    async deleteOrganization(
        organizationId: string,
        confirmationSlug: string
    ): Promise<OrganizationSession> {
        const response = await api.delete<OrganizationSession>(
            `/Organizations/${organizationId}`,
            { data: { confirmationSlug } }
        );

        return response.data;
    },
};
