import {
    Activity,
    AlertCircle,
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    ListTodo,
} from "lucide-react";

import { useNavigate } from "react-router";

import { Card } from "@/components/ui/card";

import { useRecentWorkItems } from "../hooks/useRecentWorkItems";


/* =========================================================
   RELATIVE TIME
   ========================================================= */

function formatRelativeTime(
    value: string
) {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }


    const diff =
        Date.now() -
        date.getTime();


    if (diff < 0) {
        return "Just now";
    }


    const seconds =
        Math.floor(
            diff / 1000
        );


    if (seconds < 60) {
        return "Just now";
    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    if (minutes < 60) {
        return `${minutes}m ago`;
    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {
        return `${hours}h ago`;
    }


    const days =
        Math.floor(
            hours / 24
        );


    if (days === 1) {
        return "Yesterday";
    }


    if (days < 7) {
        return `${days}d ago`;
    }


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "numeric",
            month: "short",
        }
    ).format(date);
}


/* =========================================================
   STATUS ICON
   ========================================================= */

function getStatusIcon(
    status: string
) {

    switch (
        status
            ?.trim()
            .toLowerCase()
    ) {

        case "completed":

            return (
                <CheckCircle2
                    className="
                        h-4
                        w-4
                        text-emerald-600
                    "
                />
            );


        case "blocked":

            return (
                <AlertCircle
                    className="
                        h-4
                        w-4
                        text-red-600
                    "
                />
            );


        default:

            return (
                <ListTodo
                    className="
                        h-4
                        w-4
                        text-blue-600
                    "
                />
            );
    }
}


/* =========================================================
   STATUS STYLE
   ========================================================= */

function statusClass(
    status: string
) {

    switch (
        status
            ?.trim()
            .toLowerCase()
    ) {

        case "completed":

            return `
                border-emerald-100
                bg-emerald-50
                text-emerald-700
            `;


        case "blocked":

            return `
                border-red-100
                bg-red-50
                text-red-700
            `;


        default:

            return `
                border-blue-100
                bg-blue-50
                text-blue-700
            `;
    }
}


/* =========================================================
   PRIORITY STYLE
   ========================================================= */

function priorityClass(
    priority: string
) {

    switch (
        priority
            ?.trim()
            .toLowerCase()
    ) {

        case "critical":
        case "urgent":

            return `
                border-red-100
                bg-red-50
                text-red-700
            `;


        case "high":

            return `
                border-orange-100
                bg-orange-50
                text-orange-700
            `;


        case "medium":

            return `
                border-amber-100
                bg-amber-50
                text-amber-700
            `;


        case "low":

            return `
                border-blue-100
                bg-blue-50
                text-blue-700
            `;


        default:

            return `
                border-slate-200
                bg-slate-100
                text-slate-600
            `;
    }
}


/* =========================================================
   COMPONENT
   ========================================================= */

export default function RecentWorkItems() {

    const navigate =
        useNavigate();


    const {
        data,
        isLoading,
        error,
    } = useRecentWorkItems();


    /* =====================================================
       LOADING
       ===================================================== */

    if (isLoading) {

        return (
            <Card
                className="
                    h-full
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-8
                    shadow-sm
                "
            >

                <div className="animate-pulse">

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <div>

                            <div className="
                                h-6
                                w-48
                                rounded
                                bg-slate-200
                            " />

                            <div className="
                                mt-2
                                h-4
                                w-60
                                rounded
                                bg-slate-100
                            " />

                        </div>


                        <div className="
                            h-10
                            w-10
                            rounded-xl
                            bg-slate-100
                        " />

                    </div>


                    <div className="
                        mt-6
                        space-y-3
                    ">

                        {Array.from({
                            length: 5,
                        }).map(
                            (_, index) => (

                                <div
                                    key={index}
                                    className="
                                        h-[82px]
                                        rounded-xl
                                        bg-slate-100
                                    "
                                />

                            )
                        )}

                    </div>

                </div>

            </Card>
        );
    }


    /* =====================================================
       ERROR
       ===================================================== */

    if (
        error ||
        !data
    ) {

        return (
            <Card
                className="
                    flex
                    h-full
                    min-h-[360px]
                    flex-col
                    items-center
                    justify-center
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-8
                    text-center
                    shadow-sm
                "
            >

                <div className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    bg-red-50
                ">

                    <AlertCircle
                        className="
                            h-5
                            w-5
                            text-red-600
                        "
                    />

                </div>


                <p className="
                    mt-3
                    text-sm
                    font-semibold
                    text-slate-900
                ">
                    Unable to load recent work
                </p>


                <p className="
                    mt-1
                    text-xs
                    text-slate-500
                ">
                    Please try again later.
                </p>

            </Card>
        );
    }


    const items =
        Array.isArray(
            data.data
        )
            ? data.data.slice(
                  0,
                  5
              )
            : [];


    /* =====================================================
       EMPTY
       ===================================================== */

    if (items.length === 0) {

        return (
            <Card
                className="
                    flex
                    h-full
                    min-h-[360px]
                    flex-col
                    items-center
                    justify-center
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-8
                    text-center
                    shadow-sm
                "
            >

                <div className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-100
                ">

                    <Activity
                        className="
                            h-5
                            w-5
                            text-slate-500
                        "
                    />

                </div>


                <p className="
                    mt-3
                    font-medium
                    text-slate-900
                ">
                    No recent activity
                </p>


                <p className="
                    mt-1
                    max-w-[260px]
                    text-sm
                    text-slate-500
                ">
                    Recent work item activity will appear here.
                </p>

            </Card>
        );
    }


    const openBoard = (
        projectId: string,
        boardId: string
    ) => {

        navigate(
            `/projects/${projectId}/boards/${boardId}`
        );

    };


    return (
        <Card
            className="
                flex
                h-full
                flex-col
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-8
                shadow-sm
            "
        >

            {/* =================================================
                HEADER
               ================================================= */}

            <div className="
                flex
                items-start
                justify-between
                gap-4
            ">

                <div>

                    <h2 className="
                        text-xl
                        font-semibold
                        text-slate-900
                    ">
                        Recent Work Items
                    </h2>


                    <p className="
                        mt-1
                        text-sm
                        text-slate-500
                    ">
                        Latest activity across your workspace
                    </p>

                </div>


                <div className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-600
                ">

                    <Activity
                        className="h-5 w-5"
                    />

                </div>

            </div>


            {/* =================================================
                ITEMS
               ================================================= */}

            <div className="
                mt-6
                flex-1
                space-y-3
            ">

                {items.map(
                    (item) => (

                        <button
                            key={
                                item.workItemId
                            }
                            type="button"
                            onClick={() =>
                                openBoard(
                                    item.projectId,
                                    item.boardId
                                )
                            }
                            className="
                                group
                                block
                                w-full
                                rounded-xl
                                border
                                border-slate-100
                                p-4
                                text-left
                                transition-all
                                duration-200
                                hover:border-slate-200
                                hover:bg-slate-50
                                focus:outline-none
                                focus:ring-2
                                focus:ring-blue-500/20
                            "
                        >

                            <div className="
                                flex
                                items-start
                                gap-3
                            ">

                                {/* STATUS ICON */}

                                <div
                                    className="
                                        mt-0.5
                                        flex
                                        h-8
                                        w-8
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-slate-50
                                    "
                                >

                                    {
                                        getStatusIcon(
                                            item.status
                                        )
                                    }

                                </div>


                                {/* CONTENT */}

                                <div className="
                                    min-w-0
                                    flex-1
                                ">

                                    <div className="
                                        flex
                                        items-start
                                        justify-between
                                        gap-3
                                    ">

                                        <p className="
                                            min-w-0
                                            truncate
                                            text-sm
                                            font-semibold
                                            text-slate-900
                                        ">
                                            {item.title}
                                        </p>


                                        <span
                                            className="
                                                flex
                                                shrink-0
                                                items-center
                                                gap-1
                                                text-[11px]
                                                text-slate-400
                                            "
                                        >

                                            <Clock3
                                                className="
                                                    h-3
                                                    w-3
                                                "
                                            />

                                            {
                                                formatRelativeTime(
                                                    item.lastActivityAt
                                                )
                                            }

                                        </span>

                                    </div>


                                    {/* CONTEXT */}

                                    <p className="
                                        mt-1
                                        truncate
                                        text-xs
                                        text-slate-500
                                    ">

                                        {item.projectName}

                                        <span className="
                                            mx-1.5
                                            text-slate-300
                                        ">
                                            •
                                        </span>

                                        {item.boardName}

                                        <span className="
                                            mx-1.5
                                            text-slate-300
                                        ">
                                            •
                                        </span>

                                        {item.columnName}

                                    </p>


                                    {/* BADGES */}

                                    <div className="
                                        mt-2
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-2
                                    ">

                                        <span
                                            className={`
                                                rounded-full
                                                border
                                                px-2
                                                py-0.5
                                                text-[10px]
                                                font-semibold
                                                ${statusClass(
                                                    item.status
                                                )}
                                            `}
                                        >
                                            {item.status}
                                        </span>


                                        <span
                                            className={`
                                                rounded-full
                                                border
                                                px-2
                                                py-0.5
                                                text-[10px]
                                                font-semibold
                                                ${priorityClass(
                                                    item.priority
                                                )}
                                            `}
                                        >
                                            {item.priority}
                                        </span>


                                        <ArrowUpRight
                                            className="
                                                ml-auto
                                                h-3.5
                                                w-3.5
                                                text-slate-300
                                                opacity-0
                                                transition
                                                group-hover:opacity-100
                                                group-hover:text-blue-500
                                            "
                                        />

                                    </div>

                                </div>

                            </div>

                        </button>

                    )
                )}

            </div>


            {/* =================================================
                FOOTER
               ================================================= */}

            {data.data &&
                data.data.length > 5 && (

                    <div className="
                        mt-4
                        border-t
                        border-slate-100
                        pt-4
                        text-center
                    ">

                        <span className="
                            text-xs
                            font-medium
                            text-slate-500
                        ">
                            +{data.data.length - 5} more recent work items
                        </span>

                    </div>

                )}

        </Card>
    );
}