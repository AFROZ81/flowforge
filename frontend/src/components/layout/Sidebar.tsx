import {
    FolderKanban,
    LayoutDashboard,
    Settings,
    UserCircle2,
    ChevronRight,
} from "lucide-react";

import { NavLink } from "react-router";

const primaryNavigation = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        end: true,
    },
    {
        title: "Projects",
        icon: FolderKanban,
        href: "/projects",
        end: false,
    },
];

const workspaceNavigation = [
    {
        title: "Settings",
        icon: Settings,
        href: "/settings",
        end: false,
    },
];

export default function Sidebar() {
    return (
        <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">

            {/* =====================================================
                BRAND
            ===================================================== */}
            <div className="border-b border-slate-200 px-5 py-4">

                <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
                        F
                    </div>

                    <div className="min-w-0">

                        <h1 className="truncate text-sm font-bold tracking-tight text-slate-900">
                            FlowForge
                        </h1>

                        <p className="truncate text-[11px] text-slate-500">
                            Enterprise Workspace
                        </p>

                    </div>

                </div>

            </div>


            {/* =====================================================
                NAVIGATION
            ===================================================== */}
            <div className="flex-1 overflow-y-auto px-3 py-5">

                {/* Workspace */}
                <div className="mb-6">

                    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Workspace
                    </p>

                    <nav className="space-y-1">

                        {primaryNavigation.map((item) => {

                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.title}
                                    to={item.href}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        [
                                            "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
                                            "text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                        ].join(" ")
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <Icon
                                                size={18}
                                                strokeWidth={isActive ? 2.2 : 1.8}
                                                className={
                                                    isActive
                                                        ? "text-blue-600"
                                                        : "text-slate-400 group-hover:text-slate-600"
                                                }
                                            />

                                            <span>
                                                {item.title}
                                            </span>
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}

                    </nav>

                </div>


                {/* Workspace Management */}
                <div>

                    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Workspace
                    </p>

                    <nav className="space-y-1">

                        {workspaceNavigation.map((item) => {

                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.title}
                                    to={item.href}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        [
                                            "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
                                            "text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                        ].join(" ")
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <Icon
                                                size={18}
                                                strokeWidth={isActive ? 2.2 : 1.8}
                                                className={
                                                    isActive
                                                        ? "text-blue-600"
                                                        : "text-slate-400 group-hover:text-slate-600"
                                                }
                                            />

                                            <span>
                                                {item.title}
                                            </span>
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}

                    </nav>

                </div>

            </div>


            {/* =====================================================
                USER
            ===================================================== */}
            <div className="border-t border-slate-200 p-3">

                <button
                    type="button"
                    className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-100"
                >

                    <UserCircle2
                        size={34}
                        strokeWidth={1.7}
                        className="shrink-0 text-slate-500"
                    />

                    <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-semibold text-slate-900">
                            Afroz
                        </p>

                        <p className="truncate text-[11px] text-slate-500">
                            Administrator
                        </p>

                    </div>

                    <ChevronRight
                        size={15}
                        className="text-slate-400 transition-transform group-hover:translate-x-0.5"
                    />

                </button>

            </div>

        </aside>
    );
}