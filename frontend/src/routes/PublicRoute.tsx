import { Navigate, Outlet } from "react-router";

import { useAuthStore } from "@/stores/auth.store";

export default function PublicRoute() {
    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated
    );

    return isAuthenticated
        ? <Navigate to="/dashboard" replace />
        : <Outlet />;
}