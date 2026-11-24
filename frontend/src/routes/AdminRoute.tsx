import { Navigate, Outlet } from "react-router";

import { useAuthStore } from "@/stores/auth.store";

export default function AdminRoute() {
    const role = useAuthStore((state) => state.user?.role);

    if (role?.toLowerCase() !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
