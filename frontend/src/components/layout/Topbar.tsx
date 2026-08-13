import {
    Bell,
    Search,
    Sun,
    UserCircle2,
} from "lucide-react";

import { Input } from "@/components/ui/input";

import OnlineMembers from "@/features/presence/components/OnlineMembers";

export default function Topbar() {
    return (
        <header
            className="
                sticky
                top-0
                z-30
                flex
                h-20
                items-center
                justify-between
                border-b
                border-slate-200
                bg-white
                px-8
            "
        >
            {/* =================================================
                LEFT
               ================================================= */}

            <div className="
                relative
                w-full
                max-w-md
            ">
                <Search
                    size={18}
                    className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                    "
                />

                <Input
                    placeholder="Search projects, boards, tasks..."
                    className="
                        h-11
                        rounded-xl
                        pl-11
                    "
                />
            </div>

            {/* =================================================
                RIGHT
               ================================================= */}

            <div className="
                flex
                items-center
                gap-2
            ">
                {/* =============================================
                    ONLINE MEMBERS
                   ============================================= */}

                <OnlineMembers />

                {/* =============================================
                    NOTIFICATIONS
                   ============================================= */}

                <button
                    type="button"
                    aria-label="Notifications"
                    className="
                        rounded-xl
                        p-2
                        text-slate-500
                        transition
                        hover:bg-slate-100
                        hover:text-slate-900
                    "
                >
                    <Bell size={20} />
                </button>

                {/* =============================================
                    THEME
                   ============================================= */}

                <button
                    type="button"
                    aria-label="Toggle theme"
                    className="
                        rounded-xl
                        p-2
                        text-slate-500
                        transition
                        hover:bg-slate-100
                        hover:text-slate-900
                    "
                >
                    <Sun size={20} />
                </button>

                {/* =============================================
                    USER
                   ============================================= */}

                <button
                    type="button"
                    className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        p-2
                        transition
                        hover:bg-slate-100
                    "
                >
                    <UserCircle2
                        size={36}
                        className="text-slate-500"
                    />

                    <div className="
                        hidden
                        text-left
                        md:block
                    ">
                        <p className="
                            text-sm
                            font-semibold
                        ">
                            Afroz
                        </p>

                        <p className="
                            text-xs
                            text-slate-500
                        ">
                            Administrator
                        </p>
                    </div>
                </button>
            </div>
        </header>
    );
}