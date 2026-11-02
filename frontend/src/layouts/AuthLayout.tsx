import { Outlet } from "react-router";

function AuthLayout() {
    return (
        <div className="min-h-screen bg-surface-muted">
            <Outlet />
        </div>
    );
}

export default AuthLayout;