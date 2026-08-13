import {
    useMemo,
    useState,
} from "react";

import {
    Users,
    Wifi,
    WifiOff,
} from "lucide-react";

import {
    usePresenceContext,
} from "../context/PresenceContext";


export default function BoardPresence() {

    const {
        boardViewers,
        isBoardConnected,
    } = usePresenceContext();


    const [
        open,
        setOpen,
    ] = useState(false);


    const visibleUsers =
        boardViewers.slice(
            0,
            4
        );


    const remainingCount =
        Math.max(
            0,
            boardViewers.length -
                visibleUsers.length
        );


    const initials =
        (
            name: string
        ) => {

            const parts =
                name
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean);


            if (
                parts.length ===
                0
            ) {
                return "?";
            }


            if (
                parts.length ===
                1
            ) {
                return parts[0]
                    .slice(0, 1)
                    .toUpperCase();
            }


            return (
                parts[0]
                    .slice(0, 1) +
                parts[
                    parts.length - 1
                ].slice(0, 1)
            ).toUpperCase();
        };


    const userSummary =
        useMemo(
            () =>
                boardViewers
                    .map(
                        user =>
                            user.userName
                    )
                    .join(
                        ", "
                    ),
            [boardViewers]
        );


    return (
        <div className="relative">

            <button
                type="button"
                onClick={() =>
                    setOpen(
                        current =>
                            !current
                    )
                }
                className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    bg-white
                    px-2.5
                    py-1.5
                    shadow-sm
                    transition
                    hover:bg-gray-50
                "
                title={
                    boardViewers.length >
                    0
                        ? userSummary
                        : "No other users on this board"
                }
            >

                {/* Connection indicator */}

                <span
                    className={`
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-full
                        ${
                            isBoardConnected
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-gray-100 text-gray-400"
                        }
                    `}
                >

                    {isBoardConnected ? (
                        <Wifi className="h-3.5 w-3.5" />
                    ) : (
                        <WifiOff className="h-3.5 w-3.5" />
                    )}

                </span>


                {/* Avatars */}

                {boardViewers.length >
                0 ? (

                    <div className="flex items-center">

                        {visibleUsers.map(
                            (
                                user,
                                index
                            ) => (

                                <div
                                    key={
                                        user.userId
                                    }
                                    className="
                                        relative
                                        -ml-1.5
                                        first:ml-0
                                        flex
                                        h-7
                                        w-7
                                        items-center
                                        justify-center
                                        rounded-full
                                        border-2
                                        border-white
                                        bg-slate-100
                                        text-[10px]
                                        font-semibold
                                        text-slate-700
                                    "
                                    style={{
                                        zIndex:
                                            visibleUsers.length -
                                            index,
                                    }}
                                    title={
                                        user.userName
                                    }
                                >

                                    {initials(
                                        user.userName
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

                    </div>

                ) : (

                    <Users className="
                        h-4
                        w-4
                        text-gray-400
                    " />

                )}


                {/* Count */}

                <span className="
                    hidden
                    text-xs
                    font-medium
                    text-gray-600
                    sm:inline
                ">

                    {boardViewers.length ===
                    0
                        ? "No viewers"
                        : boardViewers.length ===
                          1
                        ? "1 viewer"
                        : `${boardViewers.length} viewers`}

                </span>


                {remainingCount >
                    0 && (
                    <span className="
                        rounded-full
                        bg-gray-100
                        px-1.5
                        py-0.5
                        text-[10px]
                        font-medium
                        text-gray-600
                    ">
                        +{remainingCount}
                    </span>
                )}

            </button>


            {/* =================================================
               DROPDOWN
               ================================================= */}

            {open && (

                <>

                    <button
                        type="button"
                        aria-label="Close viewers"
                        className="
                            fixed
                            inset-0
                            z-40
                            cursor-default
                        "
                        onClick={() =>
                            setOpen(
                                false
                            )
                        }
                    />

                    <div className="
                        absolute
                        right-0
                        top-full
                        z-50
                        mt-2
                        w-72
                        overflow-hidden
                        rounded-xl
                        border
                        bg-white
                        shadow-lg
                    ">

                        <div className="
                            border-b
                            px-4
                            py-3
                        ">

                            <div className="
                                flex
                                items-center
                                justify-between
                            ">

                                <div>

                                    <p className="
                                        text-sm
                                        font-semibold
                                        text-gray-900
                                    ">
                                        People on this board
                                    </p>

                                    <p className="
                                        mt-0.5
                                        text-xs
                                        text-gray-500
                                    ">
                                        Currently viewing this board
                                    </p>

                                </div>


                                <span
                                    className={`
                                        h-2
                                        w-2
                                        rounded-full
                                        ${
                                            isBoardConnected
                                                ? "bg-emerald-500"
                                                : "bg-gray-300"
                                        }
                                    `}
                                />

                            </div>

                        </div>


                        {boardViewers.length ===
                        0 ? (

                            <div className="
                                px-4
                                py-8
                                text-center
                            ">

                                <Users className="
                                    mx-auto
                                    h-5
                                    w-5
                                    text-gray-300
                                " />

                                <p className="
                                    mt-2
                                    text-xs
                                    text-gray-500
                                ">
                                    You're the only person
                                    viewing this board.
                                </p>

                            </div>

                        ) : (

                            <div className="
                                max-h-72
                                overflow-y-auto
                                py-1
                            ">

                                {boardViewers.map(
                                    user => (

                                        <div
                                            key={
                                                user.userId
                                            }
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                                px-4
                                                py-2.5
                                                hover:bg-gray-50
                                            "
                                        >

                                            <div className="
                                                relative
                                                flex
                                                h-8
                                                w-8
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-slate-100
                                                text-xs
                                                font-semibold
                                                text-slate-700
                                            ">

                                                {initials(
                                                    user.userName
                                                )}

                                                <span className="
                                                    absolute
                                                    bottom-0
                                                    right-0
                                                    h-2
                                                    w-2
                                                    rounded-full
                                                    border
                                                    border-white
                                                    bg-emerald-500
                                                " />

                                            </div>


                                            <div className="
                                                min-w-0
                                            ">

                                                <p className="
                                                    truncate
                                                    text-sm
                                                    font-medium
                                                    text-gray-900
                                                ">
                                                    {user.userName}
                                                </p>

                                                <p className="
                                                    text-xs
                                                    text-emerald-600
                                                ">
                                                    Viewing this board
                                                </p>

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                    </div>

                </>
            )}

        </div>
    );
}