import {
    createBrowserRouter,
    Navigate,
} from "react-router";

import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicRoute from "@/routes/PublicRoute";

import LoginPage from "@/features/auth/pages/LoginPage";

import LandingPage from "@/features/landing/pages/LandingPage";

import DashboardPage from "@/features/dashboard/pages/DashboardPage";

import ProjectsPage from "@/features/projects/pages/ProjectsPage";
import ProjectDetailsPage from "@/features/projects/pages/ProjectDetailsPage";

import BoardDetailsPage from "@/features/boards/pages/BoardDetailsPage";

import ReportsPage from "@/features/reports/pages/ReportsPage";

import SettingsPage from "@/features/settings/pages/SettingsPage";


/* =========================================================
   ROOT
   ========================================================= */

/*
 * `/` used to be a redirect that picked between the dashboard and the
 * sign-in form. It is now the landing page, and the choosing is done by
 * PublicRoute, which already sends a session to /dashboard — so an
 * authenticated visitor never sees the marketing surface, and an anonymous
 * one is no longer dumped on a form before they know what it is for.
 */


/* =========================================================
   ROUTER
   ========================================================= */

export const router =
    createBrowserRouter([

        /* =================================================
           PUBLIC ROUTES
           ================================================= */

        {
            element:
                <PublicRoute />,

            children: [

                /* -----------------------------------------
                   LANDING
                   ----------------------------------------- */

                {
                    index: true,

                    element:
                        <LandingPage />,
                },


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
                <Navigate
                    to="/"
                    replace
                />,
        },

    ]);