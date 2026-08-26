import {
    createBrowserRouter,
    Navigate,
} from "react-router";

import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicRoute from "@/routes/PublicRoute";

import LoginPage from "@/features/auth/pages/LoginPage";

import DashboardPage from "@/features/dashboard/pages/DashboardPage";

import ProjectsPage from "@/features/projects/pages/ProjectsPage";
import ProjectDetailsPage from "@/features/projects/pages/ProjectDetailsPage";

import BoardDetailsPage from "@/features/boards/pages/BoardDetailsPage";

import ReportsPage from "@/features/reports/pages/ReportsPage";

import SettingsPage from "@/features/settings/pages/SettingsPage";

import { useAuthStore } from "@/stores/auth.store";


/* =========================================================
   ROOT REDIRECT
   ========================================================= */

function RootRedirect() {

    const isAuthenticated =
        useAuthStore(
            (state) =>
                state.isAuthenticated
        );


    /*
     * Authenticated:
     *
     *      / → /dashboard
     *
     * Not authenticated:
     *
     *      / → /login
     */

    return (
        <Navigate
            to={
                isAuthenticated
                    ? "/dashboard"
                    : "/login"
            }
            replace
        />
    );
}


/* =========================================================
   ROUTER
   ========================================================= */

export const router =
    createBrowserRouter([

        /* =================================================
           ROOT
           ================================================= */

        {
            path: "/",

            element:
                <RootRedirect />,
        },


        /* =================================================
           PUBLIC ROUTES
           ================================================= */

        {
            element:
                <PublicRoute />,

            children: [

                /* -----------------------------------------
                   LOGIN
                   ----------------------------------------- */

                {
                    path: "/login",

                    element:
                        <LoginPage />,
                },

            ],
        },


        /* =================================================
           PROTECTED ROUTES
           ================================================= */

        {
            element:
                <ProtectedRoute />,

            children: [

                /* -----------------------------------------
                   DASHBOARD
                   ----------------------------------------- */

                {
                    path: "/dashboard",

                    element:
                        <DashboardPage />,
                },


                /* -----------------------------------------
                   PROJECTS
                   ----------------------------------------- */

                {
                    path: "/projects",

                    element:
                        <ProjectsPage />,
                },


                /* -----------------------------------------
                   PROJECT DETAILS
                   ----------------------------------------- */

                {
                    path:
                        "/projects/:id",

                    element:
                        <ProjectDetailsPage />,
                },


                /* -----------------------------------------
                   BOARD DETAILS
                   ----------------------------------------- */

                {
                    path:
                        "/projects/:projectId/boards/:boardId",

                    element:
                        <BoardDetailsPage />,
                },


                /* -----------------------------------------
                   REPORTS
                   ----------------------------------------- */

                {
                    path: "/reports",

                    element:
                        <ReportsPage />,
                },


                /* -----------------------------------------
                   SETTINGS
                   ----------------------------------------- */

                {
                    path: "/settings",

                    element:
                        <SettingsPage />,
                },

            ],
        },


        /* =================================================
           FALLBACK
           ================================================= */

        {
            path: "*",

            element:
                <RootRedirect />,
        },

    ]);