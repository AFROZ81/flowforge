import {
    Navigate,
    Outlet,
    useLocation,
} from "react-router";

import { useAuthStore } from "@/stores/auth.store";


export default function PublicRoute() {

    const organizationId =
        useAuthStore(
            (state) =>
                state.user?.organizationId
        );

    const isAuthenticated =
        useAuthStore(
            (state) =>
                state.isAuthenticated
        );


    /* =====================================================
       ALREADY LOGGED IN
       ===================================================== */

    const location = useLocation();

    if (isAuthenticated) {
        const invitationToken = new URLSearchParams(location.search)
            .get("invitationToken")
            ?? (location.pathname === "/accept-invitation"
                ? new URLSearchParams(location.search).get("token")
                : null);

        if (invitationToken) {
            return (
                <Navigate
                    to={`/onboarding?invitationToken=${encodeURIComponent(invitationToken)}`}
                    replace
                />
            );
        }

        return (
            <Navigate
                to={organizationId ? "/dashboard" : "/onboarding"}
                replace
            />
        );
    }


    /* =====================================================
       NOT LOGGED IN
       ===================================================== */

    return (
        <Outlet />
    );
}