import {
    create,
} from "zustand";

import {
    persist,
    createJSONStorage,
} from "zustand/middleware";

import api from "@/lib/api";


/* =========================================================
   USER
   ========================================================= */

export type AuthUser = {
    id: string | null;
    fullName: string | null;
    email: string | null;
    organizationId: string | null;
    organizationIds: string[];
    role: string | null;
};


/* =========================================================
   AUTH STATE
   ========================================================= */

type AuthState = {
    accessToken: string | null;
    expiresAtUtc: string | null;
    isAuthenticated: boolean;

    user: AuthUser | null;

    login: (
        token: string,
        expires: string
    ) => void;

    switchOrganization: (organizationId: string) => Promise<void>;

    logout: () => void;
};


/* =========================================================
   JWT DECODER
   ========================================================= */

function decodeJwtPayload(
    token: string
): Record<string, unknown> | null {

    try {

        const parts =
            token.split(".");

        if (parts.length !== 3) {
            return null;
        }

        const base64Url =
            parts[1];

        const base64 =
            base64Url
                .replace(/-/g, "+")
                .replace(/_/g, "/");

        const padded =
            base64.padEnd(
                base64.length +
                    ((4 - (base64.length % 4)) % 4),
                "="
            );

        const binary =
            atob(padded);

        const bytes =
            Uint8Array.from(
                binary,
                (character) =>
                    character.charCodeAt(0)
            );

        const json =
            new TextDecoder().decode(bytes);

        return JSON.parse(json);

    } catch (error) {

        console.error(
            "Auth: failed to decode JWT.",
            error
        );

        return null;
    }
}


/* =========================================================
   CLAIM HELPER
   ========================================================= */

function getClaim(
    payload: Record<string, unknown>,
    keys: string[]
): string | null {

    for (const key of keys) {

        const value =
            payload[key];

        if (
            typeof value === "string" &&
            value.trim().length > 0
        ) {

            return value.trim();

        }
    }

    return null;
}


function getClaimArray(
    payload: Record<string, unknown>,
    keys: string[]
): string[] {

    for (const key of keys) {

        const value =
            payload[key];

        if (
            typeof value === "string" &&
            value.trim().length > 0
        ) {

            try {
                return JSON.parse(value.trim());
            } catch {
                return value.trim().split(",").map(s => s.trim());
            }
        }
    }

    return [];
}


/* =========================================================
   USER FROM JWT
   ========================================================= */

function getUserFromToken(
    token: string
): AuthUser {

    const payload =
        decodeJwtPayload(token);

    if (!payload) {

        return {
            id: null,
            fullName: null,
            email: null,
            organizationId: null,
            organizationIds: [],
            role: null,
        };
    }


    const id =
        getClaim(
            payload,
            [
                "nameid",
                "sub",
                "userId",
                "id",

                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
            ]
        );


    const fullName =
        getClaim(
            payload,
            [
                "fullName",
                "name",
                "unique_name",

                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
            ]
        );


    const email =
        getClaim(
            payload,
            [
                "email",

                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
            ]
        );


    const organizationId =
        getClaim(
            payload,
            [
                "organizationId",
                "OrganizationId",
            ]
        );

    const organizationIds =
        getClaimArray(
            payload,
            [
                "orgIds",
                "OrgIds",
            ]
        );

    const role =
        getClaim(
            payload,
            [
                "role",
                "Role",
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
            ]
        );

    return {
        id,
        fullName,
        email,
        organizationId,
        organizationIds,
        role,
    };
}


/* =========================================================
   AUTH STORE
   ========================================================= */

export const useAuthStore =
    create<AuthState>()(

        persist(

            (set, get) => ({

                accessToken:
                    null,

                expiresAtUtc:
                    null,

                isAuthenticated:
                    false,

                user:
                    null,


                /* =============================================
                   LOGIN
                   ============================================= */

                login: (
                    token,
                    expires
                ) => {

                    const user =
                        getUserFromToken(
                            token
                        );


                    console.log(
                        "Auth: login successful.",
                        user
                    );


                    set({

                        accessToken:
                            token,

                        expiresAtUtc:
                            expires,

                        isAuthenticated:
                            true,

                        user,

                    });

                },


                /* =============================================
                   SWITCH ORGANIZATION
                   ============================================= */

                switchOrganization: async (
                    organizationId: string
                ) => {

                    const { accessToken } =
                        get();

                    if (!accessToken) {
                        throw new Error(
                            "No access token available."
                        );
                    }

                    const response =
                        await api.post(
                            "/Organizations/switch",
                            { organizationId },
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${accessToken}`,
                                },
                            }
                        );

                    const {
                        accessToken: newToken,
                        expiresAtUtc,
                    } = response.data.data;

                    const user =
                        getUserFromToken(
                            newToken
                        );

                    set({
                        accessToken:
                            newToken,

                        expiresAtUtc,

                        user,

                    });
                },


                /* =============================================
                   LOGOUT
                   ============================================= */

                logout: () => {

                    console.log(
                        "Auth: logging out."
                    );


                    set({

                        accessToken:
                            null,

                        expiresAtUtc:
                            null,

                        isAuthenticated:
                            false,

                        user:
                            null,

                    });
                },

            }),
            /* =================================================
               PERSISTENCE
               ================================================= */
            {
                name:
                    "flowforge-auth",

                storage:
                    createJSONStorage(
                        () =>
                            sessionStorage
                    ),
            }
        )
    );