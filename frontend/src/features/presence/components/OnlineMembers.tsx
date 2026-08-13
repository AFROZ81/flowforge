import { useState } from "react";

import {
    ChevronDown,
    Circle,
    Users,
} from "lucide-react";

import {
    usePresenceContext,
} from "../context/PresenceContext";


/* =========================================================
   HELPERS
   ========================================================= */

function getInitials(fullName: string) {
    const parts = fullName
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
        return "?";
    }

    if (parts.length === 1) {
        return parts[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();
}


/* =========================================================
   COMPONENT
   ========================================================= */

export default function OnlineMembers() {
    const [open, setOpen] = useState(false);

    const {
        onlineUsers,
    } = usePresenceContext();

    const onlineCount = onlineUsers.length;

    /*
     * Don't show anything when nobody
     * is online.
     */
    if (onlineCount === 0) {
        return null;
    }

    const visibleUsers = onlineUsers.slice(0, 3);

    const remainingCount = Math.max(
        onlineCount - 3,
        0
    );

    return (
        <div className="relative">

            {/* =================================================
                TOP BAR BUTTON
               ================================================= */}

            <button
                type="button"
                onClick={() =>
                    setOpen((current) => !current)
                }
                aria-label="View online members"
                aria-expanded={open}
                className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    px-2
                    py-2
                    text-slate-600
                    transition
                    hover:bg-slate-100
                    hover:text-slate-900
                "
            >

                {/* Avatar stack */}

                <div className="flex items-center">

                    {visibleUsers.map(
                        (user, index) => (
                            <div
                                key={user.userId}
                                title={user.fullName}
                                className="
                                    relative
                                    flex
                                    h-7
                                    w-7
                                    items-center
                                    justify-center
                                    rounded-full
                                    border-2
                                    border-white
                                    bg-slate-100
                                    text-[9px]
                                    font-semibold
                                    text-slate-700
                                "
                                style={{
                                    marginLeft:
                                        index === 0
                                            ? 0
                                            : -8,
                                    zIndex:
                                        visibleUsers.length -
                                        index,
                                }}
                            >
                                {getInitials(
                                    user.fullName
                                )}

                                <span
                                    className="
                                        absolute
                                        bottom-[-1px]
                                        right-[-1px]
                                        h-2
                                        w-2
                                        rounded-full
                                        border
                                        border-white
                                        bg-emerald-500
                                    "
                                />
                            </div>
                        )
                    )}

                    {remainingCount > 0 && (
                        <div
                            className="
                                relative
                                -ml-2
                                flex
                                h-7
                                w-7
                                items-center
                                justify-center
                                rounded-full
                                border-2
                                border-white
                                bg-slate-100
                                text-[9px]
                                font-semibold
                                text-slate-600
                            "
                        >
                            +{remainingCount}
                        </div>
                    )}

                </div>


                {/* Count */}

                <span
                    className="
                        hidden
                        text-xs
                        font-medium
                        text-slate-600
                        sm:block
                    "
                >
                    {onlineCount} online
                </span>


                <ChevronDown
                    size={14}
                    className={`
                        hidden
                        text-slate-400
                        transition-transform
                        sm:block
                        ${open ? "rotate-180" : ""}
                    `}
                />

            </button>


            {/* =================================================
                POPOVER
               ================================================= */}

            {open && (
                <>
                    {/* Click-away */}

                    <button
                        type="button"
                        aria-label="Close online members"
                        onClick={() =>
                            setOpen(false)
                        }
                        className="
                            fixed
                            inset-0
                            z-40
                            cursor-default
                        "
                    />


                    {/* Popover */}

                    <div
                        className="
                            absolute
                            right-0
                            top-full
                            z-50
                            mt-2
                            w-[310px]
                            overflow-hidden
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            shadow-xl
                        "
                    >

                        {/* =================================================
                            HEADER
                           ================================================= */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                border-b
                                border-slate-100
                                px-4
                                py-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-8
                                        w-8
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-emerald-50
                                        text-emerald-600
                                    "
                                >
                                    <Users size={16} />
                                </div>


                                <div>

                                    <p
                                        className="
                                            text-sm
                                            font-semibold
                                            text-slate-900
                                        "
                                    >
                                        People online
                                    </p>


                                    <p
                                        className="
                                            mt-0.5
                                            text-xs
                                            text-slate-500
                                        "
                                    >
                                        Currently active
                                        in your workspace
                                    </p>

                                </div>

                            </div>


                            {/* Count */}

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-1.5
                                    rounded-full
                                    bg-emerald-50
                                    px-2
                                    py-1
                                    text-xs
                                    font-medium
                                    text-emerald-600
                                "
                            >

                                <Circle
                                    size={7}
                                    className="fill-current"
                                />

                                {onlineCount}

                            </div>

                        </div>


                        {/* =================================================
                            USERS
                           ================================================= */}

                        <div
                            className="
                                max-h-[300px]
                                overflow-y-auto
                                p-2
                            "
                        >

                            {onlineUsers.map(
                                (user) => (
                                    <div
                                        key={user.userId}
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                            rounded-lg
                                            px-2
                                            py-2.5
                                            transition
                                            hover:bg-slate-50
                                        "
                                    >

                                        {/* Avatar */}

                                        <div
                                            className="
                                                relative
                                                flex
                                                h-9
                                                w-9
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-slate-100
                                                text-xs
                                                font-semibold
                                                text-slate-700
                                            "
                                        >

                                            {getInitials(
                                                user.fullName
                                            )}

                                            <span
                                                className="
                                                    absolute
                                                    bottom-0
                                                    right-0
                                                    h-2.5
                                                    w-2.5
                                                    rounded-full
                                                    border-2
                                                    border-white
                                                    bg-emerald-500
                                                "
                                            />

                                        </div>


                                        {/* User */}

                                        <div
                                            className="
                                                min-w-0
                                                flex-1
                                            "
                                        >

                                            <p
                                                className="
                                                    truncate
                                                    text-sm
                                                    font-medium
                                                    text-slate-900
                                                "
                                            >
                                                {user.fullName}
                                            </p>


                                            <div
                                                className="
                                                    mt-0.5
                                                    flex
                                                    items-center
                                                    gap-1
                                                    text-[10px]
                                                    font-medium
                                                    text-emerald-600
                                                "
                                            >

                                                <Circle
                                                    size={5}
                                                    className="fill-current"
                                                />

                                                Online

                                            </div>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    </div>
                </>
            )}

        </div>
    );
}