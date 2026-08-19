import {
    FolderKanban,
    LayoutDashboard,
    Settings,
    ChevronRight,
    ChevronLeft,
    LogOut,
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
                "border-r border-slate-200 bg-white",
                "transition-[width] duration-300 ease-in-out",
                collapsed
                    ? "w-[72px]"
                    : "w-64",
            ].join(" ")}
        >

            {/* =====================================================
                BRAND
            ===================================================== */}

            <div
                className={[
                    "flex h-[60px] shrink-0 items-center border-b border-slate-200",
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

                    <div
                        className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-blue-600
                            text-sm
                            font-bold
                            text-white
                            shadow-sm
                        "
                    >
                        F
                    </div>


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
                                text-sm
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
                                text-[10px]
                                text-slate-500
                            "
                        >
                            Enterprise Workspace
                        </p>

                    </div>

                </div>

            </div>


            {/* =====================================================
                COLLAPSE BUTTON
            ===================================================== */}

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
                    top-[47px]
                    z-50
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-slate-200
                    bg-white
                    text-slate-500
                    shadow-sm
                    transition-colors
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


            {/* =====================================================
                NAVIGATION
            ===================================================== */}

            <div
                className="
                    min-h-0
                    flex-1
                    overflow-x-hidden
                    overflow-y-auto
                    px-3
                    py-5
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
                                        key={
                                            item.title
                                        }
                                        to={
                                            item.href
                                        }
                                        end={
                                            item.end
                                        }
                                        title={
                                            collapsed
                                                ? item.title
                                                : undefined
                                        }
                                        className={({
                                            isActive,
                                        }) =>
                                            [
                                                "group flex h-10 w-full items-center rounded-lg",
                                                "text-sm font-medium transition-colors",
                                                "outline-none",
                                                "focus-visible:ring-2 focus-visible:ring-blue-500/30",

                                                collapsed
                                                    ? "justify-center"
                                                    : "gap-3 px-3",

                                                isActive
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                            ].join(" ")
                                        }
                                    >

                                        {({
                                            isActive,
                                        }) => (
                                            <>

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
                                                        {
                                                            item.title
                                                        }
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
                            Workspace
                        </p>
                    )}


                    <nav className="space-y-1">

                        {workspaceNavigation.map(
                            (item) => {

                                const Icon =
                                    item.icon;


                                return (
                                    <NavLink
                                        key={
                                            item.title
                                        }
                                        to={
                                            item.href
                                        }
                                        end={
                                            item.end
                                        }
                                        title={
                                            collapsed
                                                ? item.title
                                                : undefined
                                        }
                                        className={({
                                            isActive,
                                        }) =>
                                            [
                                                "group flex h-10 w-full items-center rounded-lg",
                                                "text-sm font-medium transition-colors",
                                                "outline-none",
                                                "focus-visible:ring-2 focus-visible:ring-blue-500/30",

                                                collapsed
                                                    ? "justify-center"
                                                    : "gap-3 px-3",

                                                isActive
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                            ].join(" ")
                                        }
                                    >

                                        {({
                                            isActive,
                                        }) => (
                                            <>

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
                                                        {
                                                            item.title
                                                        }
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


            {/* =====================================================
                LOGOUT
            ===================================================== */}

            <div
                className="
                    shrink-0
                    border-t
                    border-slate-200
                    bg-white
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
                        "group flex h-10 w-full items-center rounded-lg",
                        "text-sm font-medium",
                        "text-slate-600",
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