import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
    accessToken: string | null;
    expiresAtUtc: string | null;
    isAuthenticated: boolean;

    login: (token: string, expires: string) => void;
    logout: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            expiresAtUtc: null,
            isAuthenticated: false,

            login: (token, expires) =>
                set({
                    accessToken: token,
                    expiresAtUtc: expires,
                    isAuthenticated: true,
                }),

            logout: () =>
                set({
                    accessToken: null,
                    expiresAtUtc: null,
                    isAuthenticated: false,
                }),
        }),
        {
            name: "flowforge-auth",
        }
    )
);