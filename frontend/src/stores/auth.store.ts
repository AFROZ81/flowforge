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
    role: string | null;
};


export const SESSION_CHANGED_EVENT = "flowforge:session-changed";

function notifySessionChanged() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
    }
}


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

    refreshSession: () => Promise<boolean>;

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


/* =========================================================
   USER FROM JWT
   ========================================================= */

export function getUserFromToken(
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

                    notifySessionChanged();

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
                            { organizationId }
                        );

                    const {
                        accessToken: newToken,
                        expiresAtUtc,
                    } = response.data;

                    if (!newToken || !expiresAtUtc) {
                        throw new Error("Workspace switch did not return a session.");
                    }

                    get().login(newToken, expiresAtUtc);
                },


                /* =============================================
                   REFRESH SESSION
                ============================================= */

                refreshSession: async () => {
                    const response = await api.post(
                        "/Auth/refresh"
                    );

                    const session = response.data?.data;

                    if (!session?.accessToken || !session?.expiresAtUtc) {
                        throw new Error("Refresh did not return a session.");
                    }

                    get().login(session.accessToken, session.expiresAtUtc);

                    return Boolean(get().user?.organizationId);
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

                    notifySessionChanged();
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