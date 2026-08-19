import {
    create,
} from "zustand";

import {
    persist,
    createJSONStorage,
} from "zustand/middleware";


/* =========================================================
   USER
   ========================================================= */

export type AuthUser = {
    id: string | null;
    fullName: string | null;
    email: string | null;
    organizationId: string | null;
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


    return {
        id,
        fullName,
        email,
        organizationId,
    };
}


/* =========================================================
   AUTH STORE
   ========================================================= */

export const useAuthStore =
    create<AuthState>()(

        persist(

            (set) => ({

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

                /*
                 * IMPORTANT:
                 *
                 * sessionStorage survives page refreshes.
                 *
                 * Unlike localStorage, it does not permanently
                 * remember the login across browser sessions.
                 */

                storage:
                    createJSONStorage(
                        () =>
                            sessionStorage
                    ),
            }

        )
    );