import {
    Navigate,
    Outlet,
    useLocation,
} from "react-router";

import { useAuthStore } from "@/stores/auth.store";


export default function ProtectedRoute() {

    const isAuthenticated =
        useAuthStore(
            (state) =>
                state.isAuthenticated
        );


    const location =
        useLocation();


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

    return (
        <Outlet />
    );
}