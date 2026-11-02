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
                        text-success-foreground
                    "
                />
            );


        case "blocked":

            return (
                <AlertCircle
                    className="
                        h-4
                        w-4
                        text-danger-foreground
                    "
                />
            );


        default:

            return (
                <ListTodo
                    className="
                        h-4
                        w-4
                        text-primary
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
                border-success-subtle
                bg-success-subtle
                text-success-foreground
            `;


        case "blocked":

            return `
                border-danger-subtle
                bg-danger-subtle
                text-danger-foreground
            `;


        default:

            return `
                border-primary-subtle
                bg-primary-subtle
                text-primary-hover
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
                border-danger-subtle
                bg-danger-subtle
                text-danger-foreground
            `;


        case "high":

            return `
                border-warning-subtle
                bg-warning-subtle
                text-warning-foreground
            `;


        case "medium":

            return `
                border-warning-subtle
                bg-warning-subtle
                text-warning-foreground
            `;


        case "low":

            return `
                border-primary-subtle
                bg-primary-subtle
                text-primary-hover
            `;


        default:

            return `
                border-border
                bg-surface-sunken
                text-muted-foreground
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
                    rounded-xl
                    border
                    border-border
                    bg-card
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
                                bg-border
                            " />

                            <div className="
                                mt-2
                                h-4
                                w-60
                                rounded
                                bg-surface-sunken
                            " />

                        </div>


                        <div className="
                            h-10
                            w-10
                            rounded-xl
                            bg-surface-sunken
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
                                        bg-surface-sunken
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
                    rounded-xl
                    border
                    border-border
                    bg-card
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
                    bg-danger-subtle
                ">

                    <AlertCircle
                        className="
                            h-5
                            w-5
                            text-danger-foreground
                        "
                    />

                </div>


                <p className="
                    mt-3
                    text-sm
                    font-semibold
                    text-foreground
                ">
                    Unable to load recent work
                </p>


                <p className="
                    mt-1
                    text-xs
                    text-muted-foreground
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
                    rounded-xl
                    border
                    border-border
                    bg-card
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
                    bg-surface-sunken
                ">

                    <Activity
                        className="
                            h-5
                            w-5
                            text-muted-foreground
                        "
                    />

                </div>


                <p className="
                    mt-3
                    font-medium
                    text-foreground
                ">
                    No recent activity
                </p>


                <p className="
                    mt-1
                    max-w-[260px]
                    text-sm
                    text-muted-foreground
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
                rounded-xl
                border
                border-border
                bg-card
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
                        text-foreground
                    ">
                        Recent Work Items
                    </h2>


                    <p className="
                        mt-1
                        text-sm
                        text-muted-foreground
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
                    bg-primary-subtle
                    text-primary
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
                                border-border-subtle
                                p-4
                                text-left
                                transition-all
                                duration-200
                                hover:border-border
                                hover:bg-surface-muted
                                focus-visible:outline-none
                                focus:ring-2
                                focus:ring-ring/40
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
                                        bg-surface-muted
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
                                            text-foreground
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
                                                text-muted-foreground/60
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
                                        text-muted-foreground
                                    ">

                                        {item.projectName}

                                        <span className="
                                            mx-1.5
                                            text-muted-foreground/60
                                        ">
                                            •
                                        </span>

                                        {item.boardName}

                                        <span className="
                                            mx-1.5
                                            text-muted-foreground/60
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
                                                text-muted-foreground/60
                                                opacity-0
                                                transition
                                                group-hover:opacity-100
                                                group-hover:text-primary
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
                        border-border-subtle
                        pt-4
                        text-center
                    ">

                        <span className="
                            text-xs
                            font-medium
                            text-muted-foreground
                        ">
                            +{data.data.length - 5} more recent work items
                        </span>

                    </div>

                )}

        </Card>
    );
}