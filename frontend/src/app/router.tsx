import {
    createBrowserRouter,
    Navigate,
} from "react-router";

import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicRoute from "@/routes/PublicRoute";

import LoginPage from "@/features/auth/pages/LoginPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";

import { useAuthStore } from "@/stores/auth.store";

function RootRedirect() {
    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated
    );

    return (
        <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
        />
    );
}

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootRedirect />,
    },
    {
        element: <PublicRoute />,
        children: [
            {
                path: "/login",
                element: <LoginPage />,
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/dashboard",
                element: <DashboardPage />,
            },
        ],
    },
]);