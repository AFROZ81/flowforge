import {
    FolderKanban,
    LayoutDashboard,
    Settings,
    ChevronRight,
    ChevronLeft,
    LogOut,
    BarChart3,
} from "lucide-react";

import {
    NavLink,
    useNavigate,
} from "react-router";

import { useAuthStore } from "@/stores/auth.store";


type SidebarProps = {
    collapsed: boolean;
    onToggle: () => void;
};


/* =========================================================
   PRIMARY NAVIGATION
   ========================================================= */

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
    {
        title: "Reports",
        icon: BarChart3,
        href: "/reports",
        end: false,
    },
];


/* =========================================================
   WORKSPACE NAVIGATION
   ========================================================= */

const workspaceNavigation = [
    {
        title: "Settings",
        icon: Settings,
        href: "/settings",
        end: false,
    },
];


/* =========================================================
   SIDEBAR
   ========================================================= */

export default function Sidebar({
    collapsed,
    onToggle,
}: SidebarProps) {

    const navigate = useNavigate();

    const logout =
        useAuthStore(
            (state) => state.logout
        );


    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = () => {

        logout();

        navigate(
            "/login",
            {
                replace: true,
            }
        );
    };


    return (
        <aside
            className={[
                "relative flex h-screen shrink-0 flex-col",
                "border-r border-slate-200/80 bg-white shadow-[4px_0_24px_-18px_rgba(15,23,42,0.35)]",
                "transition-[width] duration-300 ease-in-out",
                collapsed
                    ? "w-[72px]"
                    : "w-64",
            ].join(" ")}
        >

            {/* =================================================
                BRAND
            ================================================= */}

            <div
                className={[
                    "flex h-[72px] shrink-0 items-center border-b border-slate-100 bg-white/95",
                    collapsed
                        ? "justify-center px-2"
                        : "px-4",
                ].join(" ")}
            >

                <div
                    className={[
                        "flex min-w-0 items-center",
                        collapsed
                            ? "justify-center"
                            : "gap-3",
                    ].join(" ")}
                >

                    {/* Logo */}

                    <div
                        className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600
                            text-sm
                            font-bold
                            text-white
                            shadow-[0_6px_14px_-6px_rgba(37,99,235,0.75)]
                        "
                    >
                        F
                    </div>


                    {/* Brand text */}

                    <div
                        className={[
                            "overflow-hidden transition-all duration-300",
                            collapsed
                                ? "w-0 opacity-0"
                                : "w-[150px] opacity-100",
                        ].join(" ")}
                    >

                        <h1
                            className="
                                whitespace-nowrap
                                text-[15px]
                                font-bold
                                tracking-tight
                                text-slate-900
                            "
                        >
                            FlowForge
                        </h1>

                        <p
                            className="
                                whitespace-nowrap
                                text-[11px]
                                text-slate-400
                            "
                        >
                            Enterprise Workspace
                        </p>

                    </div>

                </div>

            </div>


            {/* =================================================
                COLLAPSE BUTTON
            ================================================= */}

            <button
                type="button"
                onClick={onToggle}
                aria-label={
                    collapsed
                        ? "Expand sidebar"
                        : "Collapse sidebar"
                }
                title={
                    collapsed
                        ? "Expand sidebar"
                        : "Collapse sidebar"
                }
                className="
                    absolute
                    -right-3
                    top-[55px]
                    z-50
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-slate-200/90
                    bg-white
                    text-slate-500
                    shadow-sm
                    transition-colors
                    hover:border-slate-300
                    hover:bg-slate-50
                    hover:text-slate-900
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500/30
                "
            >

                {collapsed ? (
                    <ChevronRight
                        size={14}
                        strokeWidth={2}
                    />
                ) : (
                    <ChevronLeft
                        size={14}
                        strokeWidth={2}
                    />
                )}

            </button>


            {/* =================================================
                NAVIGATION
            ================================================= */}

            <div
                className="
                    min-h-0
                    flex-1
                    overflow-x-hidden
                    overflow-y-auto
                    px-3
                    py-6
                "
            >

                {/* =================================================
                    MAIN WORKSPACE
                ================================================= */}

                <div className="mb-6">

                    {!collapsed && (
                        <p
                            className="
                                mb-2
                                px-3
                                text-[10px]
                                font-semibold
                                uppercase
                                tracking-[0.18em]
                                text-slate-400
                            "
                        >
                            Workspace
                        </p>
                    )}


                    <nav className="space-y-1">

                        {primaryNavigation.map(
                            (item) => {

                                const Icon =
                                    item.icon;


                                return (
                                    <NavLink
                                        key={item.title}
                                        to={item.href}
                                        end={item.end}
                                        title={
                                            collapsed
                                                ? item.title
                                                : undefined
                                        }
                                        className={({
                                            isActive,
                                        }) =>
                                            [
                                                "group relative flex h-11 w-full items-center rounded-xl",
                                                "text-sm font-medium transition-colors",
                                                "outline-none",
                                                "focus-visible:ring-2 focus-visible:ring-blue-500/30",

                                                collapsed
                                                    ? "justify-center"
                                                    : "gap-3 px-3",

                                                isActive
                                                    ? "bg-blue-50/80 text-blue-700 shadow-sm shadow-blue-100/70"
                                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                                            ].join(" ")
                                        }
                                    >

                                        {({
                                            isActive,
                                        }) => (
                                            <>

                                                {isActive && !collapsed && (
                                                    <span
                                                        aria-hidden="true"
                                                        className="absolute left-0 h-6 w-1 rounded-r-full bg-blue-600"
                                                    />
                                                )}

                                                <Icon
                                                    size={18}
                                                    strokeWidth={
                                                        isActive
                                                            ? 2.2
                                                            : 1.8
                                                    }
                                                    className={
                                                isActive
                                                    ? "shrink-0 text-blue-600"
                                                    : "shrink-0 text-slate-400 group-hover:text-slate-600"
                                                    }
                                                />


                                                {!collapsed && (
                                                    <span className="truncate">
                                                        {item.title}
                                                    </span>
                                                )}

                                            </>
                                        )}

                                    </NavLink>
                                );
                            }
                        )}

                    </nav>

                </div>


                {/* =================================================
                    SETTINGS
                ================================================= */}

                <div>

                    {!collapsed && (
                                    <p
                            className="
                                mb-2
                                px-3
                                text-[10px]
                                font-semibold
                                uppercase
                                tracking-[0.18em]
                                text-slate-400
                            "
                        >
                            Manage
                        </p>
                    )}


                    <nav className="space-y-1">

                        {workspaceNavigation.map(
                            (item) => {

                                const Icon =
                                    item.icon;


                                return (
                                    <NavLink
                                        key={item.title}
                                        to={item.href}
                                        end={item.end}
                                        title={
                                            collapsed
                                                ? item.title
                                                : undefined
                                        }
                                        className={({
                                            isActive,
                                        }) =>
                                            [
                                                "group relative flex h-11 w-full items-center rounded-xl",
                                                "text-sm font-medium transition-colors",
                                                "outline-none",
                                                "focus-visible:ring-2 focus-visible:ring-blue-500/30",

                                                collapsed
                                                    ? "justify-center"
                                                    : "gap-3 px-3",

                                                isActive
                                                    ? "bg-blue-50/80 text-blue-700 shadow-sm shadow-blue-100/70"
                                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                                            ].join(" ")
                                        }
                                    >

                                        {({
                                            isActive,
                                        }) => (
                                            <>

                                                {isActive && !collapsed && (
                                                    <span
                                                        aria-hidden="true"
                                                        className="absolute left-0 h-6 w-1 rounded-r-full bg-blue-600"
                                                    />
                                                )}

                                                <Icon
                                                    size={18}
                                                    strokeWidth={
                                                        isActive
                                                            ? 2.2
                                                            : 1.8
                                                    }
                                                    className={
                                                        isActive
                                                            ? "shrink-0 text-blue-600"
                                                            : "shrink-0 text-slate-400 group-hover:text-slate-600"
                                                    }
                                                />


                                                {!collapsed && (
                                                    <span className="truncate">
                                                        {item.title}
                                                    </span>
                                                )}

                                            </>
                                        )}

                                    </NavLink>
                                );
                            }
                        )}

                    </nav>

                </div>

            </div>


            {/* =================================================
                LOGOUT
            ================================================= */}

            <div
                className="
                    shrink-0
                    border-t
                    border-slate-100
                    bg-slate-50/50
                    p-3
                "
            >

                <button
                    type="button"
                    onClick={handleLogout}
                    title={
                        collapsed
                            ? "Logout"
                            : undefined
                    }
                    aria-label="Logout"
                    className={[
                        "group flex h-11 w-full items-center rounded-xl",
                        "text-sm font-medium",
                        "text-slate-500",
                        "transition-colors",
                        "outline-none",
                        "hover:bg-red-50",
                        "hover:text-red-600",
                        "focus-visible:ring-2",
                        "focus-visible:ring-red-500/30",

                        collapsed
                            ? "justify-center"
                            : "gap-3 px-3",
                    ].join(" ")}
                >

                    <LogOut
                        size={18}
                        strokeWidth={1.8}
                        className="
                            shrink-0
                            text-slate-400
                            transition-colors
                            group-hover:text-red-500
                        "
                    />


                    {!collapsed && (
                        <span>
                            Logout
                        </span>
                    )}

                </button>

            </div>

        </aside>
    );
}
