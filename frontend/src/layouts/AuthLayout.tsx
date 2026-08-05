import { Outlet } from "react-router";

function AuthLayout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Outlet />
        </div>
    );
}

export default AuthLayout;