import {
    FolderKanban,
    KanbanSquare,
    LayoutDashboard,
    Settings,
    UserCircle2,
} from "lucide-react";

import { NavLink } from "react-router";

const menu = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
    {
        title: "Projects",
        icon: FolderKanban,
        href: "/projects",
    },
    {
        title: "Boards",
        icon: KanbanSquare,
        href: "/boards",
    },
    {
        title: "Settings",
        icon: Settings,
        href: "/settings",
    },
];

export default function Sidebar() {
    return (
        <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-white">

            {/* Logo */}
            <div className="border-b border-slate-200 p-6">

                <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 text-xl font-bold text-white shadow-md">
                        F
                    </div>

                    <div>

                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            FlowForge
                        </h1>

                        <p className="text-sm text-slate-500">
                            Enterprise Workspace
                        </p>

                    </div>

                </div>

            </div>

            {/* Navigation */}
            <div className="flex-1">

                <div className="px-6 pt-6 pb-3">

                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Workspace
                    </p>

                </div>

                <nav className="space-y-2 px-3">

                    {menu.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.title}
                                to={item.href}
                                className={({ isActive }) =>
                                    `group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? "bg-blue-50 text-blue-700 shadow-sm"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                <>
                                    <Icon
                                        size={20}
                                        className={`transition-colors ${
                                            isActive
                                                ? "text-blue-600"
                                                : "text-slate-400 group-hover:text-slate-700"
                                        }`}
                                    />

                                    <span>{item.title}</span>
                                </>
                            )}
                            </NavLink>
                        );
                    })}

                </nav>

            </div>

            {/* Bottom User Section */}
            <div className="border-t border-slate-200 p-4">

                <button className="flex w-full items-center gap-3 rounded-xl p-3 transition hover:bg-slate-100">

                    <UserCircle2
                        size={42}
                        className="text-slate-500"
                    />

                    <div className="text-left">

                        <p className="text-sm font-semibold text-slate-900">
                            Afroz
                        </p>

                        <p className="text-xs text-slate-500">
                            Administrator
                        </p>

                    </div>

                </button>

            </div>

        </aside>
    );
}