import {
    createBrowserRouter,
} from "react-router";

import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicRoute from "@/routes/PublicRoute";

import LoginPage from "@/features/auth/pages/LoginPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";

export const router = createBrowserRouter([
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