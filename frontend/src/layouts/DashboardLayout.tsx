import { Outlet } from "react-router";

function DashboardLayout() {
    return (
        <div className="min-h-screen bg-slate-100">
            <Outlet />
        </div>
    );
}

export default DashboardLayout;