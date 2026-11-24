import api from "@/lib/api";

export interface CreateInvitationRequest {
    email: string;
    role: "Admin" | "Member" | "Viewer";
    message?: string;
    organizationId: string;
}

export interface CreateInvitationResponse {
    id: string;
    email: string;
    role: "Admin" | "Member" | "Viewer";
    token: string;
    expiresAt: string;
    emailStatus?: "NotSent" | "Sent" | "Failed";
    emailError?: string;
}

export interface GetInvitationsResponse {
    id: string;
    email: string;
    role: "Admin" | "Member" | "Viewer";
    isAccepted: boolean;
    expiresAt: string;
    createdAt: string;
    invitedByName: string;
    emailStatus?: "NotSent" | "Sent" | "Failed";
    emailError?: string;
}

export interface AcceptInvitationRequest {
    token: string;
}

export interface AcceptInvitationResponse {
    userId: string;
    accessToken: string;
    expiresAtUtc: string;
}

export interface InvitationDetailsResponse {
    email: string;
    organizationName: string;
    role: string;
    expiresAt: string;
    isAccepted: boolean;
}

function unwrapResponse<T>(response: unknown): T | null {
    if (typeof response === "object" && response !== null && "data" in response) {
        return (response as { data: T | null }).data;
    }

    return response as T | null;
}

async function createInvitation(request: CreateInvitationRequest): Promise<CreateInvitationResponse> {
    const response = await api.post("/Invitations", request);
    const data = unwrapResponse<CreateInvitationResponse>(response.data);

    if (!data || typeof data !== "object" || !("id" in data)) {
        throw new Error("Failed to create invitation");
    }

    return data;
}

async function getInvitations(): Promise<GetInvitationsResponse[]> {
    const response = await api.get("/Invitations");
    const data = unwrapResponse<GetInvitationsResponse[]>(response.data);

    if (!Array.isArray(data)) {
        throw new Error("The invitation list response was invalid.");
    }

    return data;
}

async function deleteInvitation(id: string): Promise<void> {
    await api.delete(`/Invitations/${id}`);
}

async function resendInvitation(id: string): Promise<void> {
    await api.post(`/Invitations/${id}/resend`);
}

async function acceptInvitation(token: string): Promise<AcceptInvitationResponse> {
    const response = await api.post("/Invitations/accept", { token });
    const data = unwrapResponse<AcceptInvitationResponse>(response.data);

    if (!data || typeof data !== "object" || !("userId" in data)) {
        throw new Error("Failed to accept invitation");
    }

    return data;
}

async function getInvitationDetails(token: string): Promise<InvitationDetailsResponse> {
    const response = await api.get(`/Invitations/validate?token=${encodeURIComponent(token)}`);
    const data = unwrapResponse<InvitationDetailsResponse>(response.data);

    if (!data || typeof data !== "object" || !("email" in data)) {
        throw new Error("Failed to load invitation details");
    }

    return data;
}

export const invitationsService = {
    createInvitation,
    getInvitations,
    deleteInvitation,
    resendInvitation,
    acceptInvitation,
    getInvitationDetails,
};