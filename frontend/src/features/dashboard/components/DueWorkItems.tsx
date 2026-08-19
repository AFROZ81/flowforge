import { useState } from "react";

import {
    AlertTriangle,
    ArrowUpRight,
    CalendarClock,
    CheckCircle2,
    Clock3,
} from "lucide-react";

import { useNavigate } from "react-router";

import { Card } from "@/components/ui/card";

import { useDueWorkItems } from "../hooks/useDueWorkItems";


type DueTab =
    | "overdue"
    | "upcoming";


/* =========================================================
   DATE HELPERS
   ========================================================= */

function parseDate(value: string) {

    const date = new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }

    return date;
}


function formatExactDate(
    value: string
) {

    const date =
        parseDate(value);

    if (!date) {
        return value || "No date";
    }

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    ).format(date);
}


function startOfDay(date: Date) {

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}


function getRelativeDueDate(
    value: string,
    isOverdue: boolean
) {

    const date =
        parseDate(value);

    if (!date) {
        return "No date";
    }


    const today =
        startOfDay(
            new Date()
        );


    const dueDate =
        startOfDay(date);


    const difference =
        Math.round(
            (
                dueDate.getTime() -
                today.getTime()
            ) /
            86_400_000
        );


    if (difference === 0) {
        return "Due today";
    }


    if (difference === 1) {
        return "Tomorrow";
    }


    if (difference === -1) {
        return "1 day overdue";
    }


    if (difference < 0) {

        return `${Math.abs(
            difference
        )} days overdue`;

    }


    if (
        difference > 1 &&
        difference <= 7
    ) {

        return `In ${difference} days`;

    }


    return isOverdue
        ? "Overdue"
        : formatExactDate(value);
}


/* =========================================================
   PRIORITY
   ========================================================= */

function priorityClass(
    priority: string
) {

    switch (
        priority
            ?.trim()
            .toLowerCase()
    ) {

        case "urgent":
        case "critical":

            return `
                border-red-100
                bg-red-50
                text-red-600
            `;


        case "high":

            return `
                border-orange-100
                bg-orange-50
                text-orange-600
            `;


        case "medium":

            return `
                border-amber-100
                bg-amber-50
                text-amber-600
            `;


        case "low":

            return `
                border-blue-100
                bg-blue-50
                text-blue-600
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

export default function DueWorkItems() {

    const navigate =
        useNavigate();


    const {
        data,
        isLoading,
        error,
    } = useDueWorkItems();


    const [
        activeTab,
        setActiveTab,
    ] = useState<DueTab>(
        "overdue"
    );


    /* =====================================================
       LOADING
       ===================================================== */

    if (isLoading) {

        return (
            <Card
                className="
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
                                w-40
                                rounded
                                bg-slate-200
                            " />

                            <div className="
                                mt-2
                                h-4
                                w-56
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
                        flex
                        gap-2
                    ">

                        <div className="
                            h-9
                            w-28
                            rounded-lg
                            bg-slate-100
                        " />

                        <div className="
                            h-9
                            w-28
                            rounded-lg
                            bg-slate-100
                        " />

                    </div>


                    <div className="
                        mt-5
                        space-y-3
                    ">

                        {Array.from({
                            length: 3,
                        }).map(
                            (_, index) => (

                                <div
                                    key={index}
                                    className="
                                        h-[86px]
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
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-8
                    shadow-sm
                "
            >

                <div className="
                    flex
                    min-h-[280px]
                    flex-col
                    items-center
                    justify-center
                    text-center
                ">

                    <div className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-full
                        bg-red-50
                    ">

                        <AlertTriangle
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
                        Unable to load due work items
                    </p>


                    <p className="
                        mt-1
                        text-xs
                        text-slate-500
                    ">
                        Please try again later.
                    </p>

                </div>

            </Card>
        );
    }


    const overdue =
        data.data?.overdue ?? [];


    const upcoming =
        data.data?.upcoming ?? [];


    const activeItems =
        activeTab === "overdue"
            ? overdue
            : upcoming;


    const visibleItems =
        activeItems.slice(
            0,
            5
        );


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
                        Due Work Items
                    </h2>


                    <p className="
                        mt-1
                        text-sm
                        text-slate-500
                    ">
                        Items requiring your attention
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
                    bg-amber-50
                    text-amber-600
                ">

                    <CalendarClock
                        className="h-5 w-5"
                    />

                </div>

            </div>


            {/* =================================================
                TABS
               ================================================= */}

            <div className="
                mt-6
                flex
                w-fit
                rounded-xl
                bg-slate-100
                p-1
            ">

                <button
                    type="button"
                    onClick={() =>
                        setActiveTab(
                            "overdue"
                        )
                    }
                    className={`
                        flex
                        h-8
                        items-center
                        gap-2
                        rounded-lg
                        px-3
                        text-xs
                        font-medium
                        transition
                        ${
                            activeTab ===
                            "overdue"
                                ? `
                                    bg-white
                                    text-red-600
                                    shadow-sm
                                  `
                                : `
                                    text-slate-500
                                    hover:text-slate-900
                                  `
                        }
                    `}
                >

                    Overdue

                    <span
                        className={`
                            flex
                            min-w-5
                            items-center
                            justify-center
                            rounded-full
                            px-1.5
                            py-0.5
                            text-[10px]
                            font-semibold
                            ${
                                activeTab ===
                                "overdue"
                                    ? `
                                        bg-red-50
                                        text-red-600
                                      `
                                    : `
                                        bg-slate-200
                                        text-slate-600
                                      `
                            }
                        `}
                    >
                        {overdue.length}
                    </span>

                </button>


                <button
                    type="button"
                    onClick={() =>
                        setActiveTab(
                            "upcoming"
                        )
                    }
                    className={`
                        flex
                        h-8
                        items-center
                        gap-2
                        rounded-lg
                        px-3
                        text-xs
                        font-medium
                        transition
                        ${
                            activeTab ===
                            "upcoming"
                                ? `
                                    bg-white
                                    text-slate-900
                                    shadow-sm
                                  `
                                : `
                                    text-slate-500
                                    hover:text-slate-900
                                  `
                        }
                    `}
                >

                    Upcoming

                    <span
                        className={`
                            flex
                            min-w-5
                            items-center
                            justify-center
                            rounded-full
                            px-1.5
                            py-0.5
                            text-[10px]
                            font-semibold
                            ${
                                activeTab ===
                                "upcoming"
                                    ? `
                                        bg-blue-50
                                        text-blue-600
                                      `
                                    : `
                                        bg-slate-200
                                        text-slate-600
                                      `
                            }
                        `}
                    >
                        {upcoming.length}
                    </span>

                </button>

            </div>


            {/* =================================================
                EMPTY
               ================================================= */}

            {visibleItems.length === 0 ? (

                <div className="
                    flex
                    min-h-[250px]
                    flex-1
                    flex-col
                    items-center
                    justify-center
                    text-center
                ">

                    <div className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-full
                        bg-emerald-50
                    ">

                        <CheckCircle2
                            className="
                                h-5
                                w-5
                                text-emerald-600
                            "
                        />

                    </div>


                    <p className="
                        mt-3
                        font-medium
                        text-slate-900
                    ">

                        {activeTab === "overdue"
                            ? "Nothing overdue"
                            : "Nothing due soon"}

                    </p>


                    <p className="
                        mt-1
                        max-w-[260px]
                        text-sm
                        text-slate-500
                    ">

                        {activeTab === "overdue"
                            ? "There are no overdue work items requiring attention."
                            : "There are no upcoming work items with a due date."}

                    </p>

                </div>

            ) : (

                <div className="
                    mt-5
                    flex-1
                    space-y-3
                ">

                    {visibleItems.map(
                        (item) => {

                            const isOverdue =
                                activeTab ===
                                "overdue";


                            return (
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
                                        justify-between
                                        gap-4
                                    ">

                                        <div className="
                                            min-w-0
                                            flex-1
                                        ">

                                            <div className="
                                                flex
                                                flex-wrap
                                                items-center
                                                gap-2
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
                                                    className={`
                                                        shrink-0
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

                                            </div>


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

                                        </div>


                                        <div
                                            title={
                                                formatExactDate(
                                                    item.dueDate
                                                )
                                            }
                                            className={`
                                                flex
                                                shrink-0
                                                items-center
                                                gap-1.5
                                                rounded-lg
                                                px-2
                                                py-1
                                                text-xs
                                                font-medium
                                                ${
                                                    isOverdue
                                                        ? `
                                                            bg-red-50
                                                            text-red-600
                                                          `
                                                        : `
                                                            bg-blue-50
                                                            text-blue-600
                                                          `
                                                }
                                            `}
                                        >

                                            {isOverdue ? (

                                                <AlertTriangle
                                                    className="
                                                        h-3.5
                                                        w-3.5
                                                    "
                                                />

                                            ) : (

                                                <Clock3
                                                    className="
                                                        h-3.5
                                                        w-3.5
                                                    "
                                                />

                                            )}


                                            {getRelativeDueDate(
                                                item.dueDate,
                                                isOverdue
                                            )}

                                        </div>

                                    </div>


                                    <div className="
                                        mt-3
                                        flex
                                        items-center
                                        justify-between
                                        border-t
                                        border-slate-100
                                        pt-3
                                    ">

                                        <span
                                            className={`
                                                flex
                                                items-center
                                                gap-1
                                                text-xs
                                                font-medium
                                                ${
                                                    isOverdue
                                                        ? "text-red-600"
                                                        : "text-blue-600"
                                                }
                                            `}
                                        >

                                            {isOverdue
                                                ? "Overdue"
                                                : "Upcoming"}

                                            <ArrowUpRight
                                                className="
                                                    h-3
                                                    w-3
                                                    opacity-0
                                                    transition
                                                    group-hover:opacity-100
                                                "
                                            />

                                        </span>


                                        <span className="
                                            rounded-md
                                            bg-slate-100
                                            px-2
                                            py-0.5
                                            text-[10px]
                                            font-medium
                                            text-slate-500
                                        ">
                                            {item.status}
                                        </span>

                                    </div>

                                </button>
                            );
                        }
                    )}

                </div>

            )}


            {/* =================================================
                MORE COUNT
               ================================================= */}

            {activeItems.length > 5 && (

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
                        +{activeItems.length - 5} more{" "}
                        {activeTab === "overdue"
                            ? "overdue"
                            : "upcoming"}{" "}
                        work items
                    </span>

                </div>

            )}

        </Card>
    );
}