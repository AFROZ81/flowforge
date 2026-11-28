import {
    Navigate,
    Outlet,
    useLocation,
} from "react-router";

import { useAuthStore } from "@/stores/auth.store";
import { useMyOrganizations } from "@/features/organizations/hooks/useOrganizations";


export default function ProtectedRoute() {

    const isAuthenticated =
        useAuthStore(
            (state) =>
                state.isAuthenticated
        );

    const organizationId =
        useAuthStore(
            (state) =>
                state.user?.organizationId
        );


    const location =
        useLocation();

    const organizations = useMyOrganizations(isAuthenticated);
    const isOnboarding = location.pathname === "/onboarding";
    const hasInvitation = new URLSearchParams(location.search).has("invitationToken");
    const currentMembership = organizations.data?.find(
        (organization) =>
            organization.id === organizationId && organization.isActive
    );


    /* =====================================================
       NOT AUTHENTICATED
       ===================================================== */

    if (!isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from:
                        location.pathname +
                        location.search,
                }}
            />
        );
    }


    /* =====================================================
       AUTHENTICATED
       ===================================================== */

    if (isAuthenticated && (organizations.isPending || organizations.isFetching && !organizations.data)) {
        return (
            <div className="grid min-h-dvh place-items-center" role="status" aria-label="Validating workspace access">
                <span className="size-6 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
        );
    }

    if (isAuthenticated && !isOnboarding && organizations.error) {
        return <Navigate to="/onboarding" replace />;
    }

    if (isAuthenticated && organizationId && !currentMembership && !isOnboarding) {
        return <Navigate to="/onboarding" replace />;
    }

    if (isAuthenticated && !organizationId && !isOnboarding) {
        return <Navigate to="/onboarding" replace />;
    }

    if (isAuthenticated && currentMembership && isOnboarding && !hasInvitation) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <Outlet />
    );
}