import {
    ChevronRight,
    Home,
    Sun,
    UserCircle2,
} from "lucide-react";

import {
    useLocation,
} from "react-router";

import OnlineMembers from "@/features/presence/components/OnlineMembers";

import {
    NotificationBell,
} from "@/features/notifications";


export default function Topbar() {

    const location = useLocation();

    /* =========================================================
       PAGE CONTEXT
       ========================================================= */

    const getPageContext = () => {

        const pathname = location.pathname.toLowerCase();

        if (pathname === "/dashboard" || pathname === "/") {
            return {
                section: "Workspace",
                page: "Dashboard",
            };
        }

        if (pathname.startsWith("/projects")) {

            /*
             * Board / project pages
             */

            if (pathname.includes("/boards/")) {
                return {
                    section: "Projects",
                    page: "Board",
                };
            }

            return {
                section: "Workspace",
                page: "Projects",
            };
        }

        if (pathname.startsWith("/settings")) {
            return {
                section: "Workspace",
                page: "Settings",
            };
        }

        return {
            section: "Workspace",
            page: "FlowForge",
        };
    };


    const context = getPageContext();


    return (
        <header
            className="
                sticky
                top-0
                z-40
                flex
                h-[58px]
                items-center
                justify-between
                border-b
                border-slate-200
                bg-white
                px-5
                lg:px-7
            "
        >

            {/* =================================================
                LEFT — PAGE CONTEXT
               ================================================= */}

            <div
                className="
                    flex
                    min-w-0
                    items-center
                    gap-2
                "
            >

                {/* Home / workspace icon */}

                <div
                    className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-slate-50
                        text-slate-500
                        ring-1
                        ring-slate-200
                    "
                >

                    <Home
                        className="
                            h-4
                            w-4
                        "
                    />

                </div>


                {/* Breadcrumb */}

                <div
                    className="
                        flex
                        min-w-0
                        items-center
                        gap-2
                    "
                >

                    <span
                        className="
                            hidden
                            text-sm
                            font-medium
                            text-slate-400
                            sm:block
                        "
                    >
                        {context.section}
                    </span>


                    <ChevronRight
                        className="
                            hidden
                            h-3.5
                            w-3.5
                            text-slate-300
                            sm:block
                        "
                    />


                    <span
                        className="
                            truncate
                            text-sm
                            font-semibold
                            text-slate-800
                        "
                    >
                        {context.page}
                    </span>

                </div>

            </div>


            {/* =================================================
                RIGHT
               ================================================= */}

            <div
                className="
                    flex
                    shrink-0
                    items-center
                    gap-1
                    sm:gap-2
                "
            >

                {/* =============================================
                    ONLINE MEMBERS
                   ============================================= */}

                <OnlineMembers />


                {/* =============================================
                    NOTIFICATIONS
                   ============================================= */}

                <NotificationBell />


                {/* =============================================
                    THEME
                   ============================================= */}

                <button
                    type="button"
                    aria-label="Toggle theme"
                    className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        text-slate-500
                        transition
                        hover:bg-slate-100
                        hover:text-slate-900
                    "
                >

                    <Sun
                        className="
                            h-[18px]
                            w-[18px]
                        "
                    />

                </button>


                {/* =============================================
                    DIVIDER
                   ============================================= */}

                <div
                    className="
                        mx-1
                        hidden
                        h-7
                        w-px
                        bg-slate-200
                        sm:block
                    "
                />


                {/* =============================================
                    USER
                   ============================================= */}

                <button
                    type="button"
                    className="
                        flex
                        items-center
                        gap-2.5
                        rounded-xl
                        px-1.5
                        py-1
                        transition
                        hover:bg-slate-50
                    "
                >

                    <UserCircle2
                        className="
                            h-9
                            w-9
                            text-slate-500
                        "
                    />


                    <div
                        className="
                            hidden
                            text-left
                            md:block
                        "
                    >

                        <p
                            className="
                                text-sm
                                font-semibold
                                leading-4
                                text-slate-900
                            "
                        >
                            Afroz
                        </p>


                        <p
                            className="
                                mt-0.5
                                text-[10px]
                                leading-3
                                text-slate-500
                            "
                        >
                            Administrator
                        </p>

                    </div>

                </button>

            </div>

        </header>
    );
}