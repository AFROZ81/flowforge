import {
    Navigate,
    Outlet,
} from "react-router";

import { useAuthStore } from "@/stores/auth.store";


export default function PublicRoute() {

    const isAuthenticated =
        useAuthStore(
            (state) =>
                state.isAuthenticated
        );


    /* =====================================================
       ALREADY LOGGED IN
       ===================================================== */

    if (isAuthenticated) {

        return (
            <Navigate
                to="/dashboard"
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