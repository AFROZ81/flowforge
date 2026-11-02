import { Outlet } from "react-router";

function DashboardLayout() {
    return (
        <div className="min-h-screen bg-surface-sunken">
            <Outlet />
        </div>
    );
}

export default DashboardLayout;