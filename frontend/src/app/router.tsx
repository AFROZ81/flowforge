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
     * User is authenticated:
     *
     *      / → /dashboard
     *
     * User is not authenticated:
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
                   BOARD
                   ----------------------------------------- */

                {
                    path:
                        "/projects/:projectId/boards/:boardId",

                    element:
                        <BoardDetailsPage />,
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