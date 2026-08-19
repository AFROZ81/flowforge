import {
    FolderKanban,
    KanbanSquare,
    ListChecks,
    TrendingUp,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import StatCard from "@/components/dashboard/StatCard";

import { useDashboardOverview } from "../hooks/useDashboardOverview";


export default function OverviewCards() {

    const {
        data,
        isLoading,
        error,
    } = useDashboardOverview();


    /* =========================================================
       LOADING
       ========================================================= */

    if (isLoading) {

        return (
            <div
                className="
                    grid
                    gap-6
                    md:grid-cols-2
                    xl:grid-cols-4
                "
            >

                {Array.from({
                    length: 4,
                }).map((_, index) => (

                    <Card
                        key={index}
                        className="
                            rounded-3xl
                            border
                            border-slate-200
                            bg-white
                            p-6
                            shadow-sm
                        "
                    >

                        <div className="
                            animate-pulse
                            space-y-4
                        ">

                            <div className="
                                h-4
                                w-24
                                rounded
                                bg-slate-200
                            " />

                            <div className="
                                h-8
                                w-16
                                rounded
                                bg-slate-200
                            " />

                            <div className="
                                h-3
                                w-20
                                rounded
                                bg-slate-100
                            " />

                        </div>

                    </Card>

                ))}

            </div>
        );
    }


    /* =========================================================
       ERROR / NULL RESPONSE
       ========================================================= */

    if (
        error ||
        !data ||
        !data.data
    ) {

        return (
            <Card
                className="
                    rounded-3xl
                    border
                    border-red-100
                    bg-white
                    p-6
                    shadow-sm
                "
            >

                <div className="
                    flex
                    items-center
                    justify-between
                    gap-4
                ">

                    <div>

                        <p className="
                            text-sm
                            font-semibold
                            text-slate-900
                        ">
                            Failed to load overview
                        </p>

                        <p className="
                            mt-1
                            text-xs
                            text-slate-500
                        ">
                            Please try refreshing the dashboard.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            window.location.reload()
                        }
                        className="
                            shrink-0
                            rounded-lg
                            border
                            border-slate-200
                            px-3
                            py-2
                            text-xs
                            font-medium
                            text-slate-600
                            transition
                            hover:bg-slate-50
                            focus:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-blue-500/30
                        "
                    >
                        Refresh
                    </button>

                </div>

            </Card>
        );
    }


    /*
     * At this point TypeScript knows that data.data
     * is not null.
     */
    const overview = data.data;


    /* =========================================================
       CARDS
       ========================================================= */

    const cards = [
        {
            title: "Projects",
            value: overview.totalProjects,
            subtitle: "Projects",
            icon: FolderKanban,
            color: "indigo" as const,
        },
        {
            title: "Boards",
            value: overview.totalBoards,
            subtitle: "Boards",
            icon: KanbanSquare,
            color: "emerald" as const,
        },
        {
            title: "Work Items",
            value: overview.totalWorkItems,
            subtitle: "Tasks",
            icon: ListChecks,
            color: "amber" as const,
        },
        {
            title: "Completion",
            value: `${overview.completionPercentage}%`,
            subtitle: "Progress",
            icon: TrendingUp,
            color: "purple" as const,
        },
    ];

    /* =========================================================
       RENDER
       ========================================================= */

    return (
        <div
            className="
                grid
                gap-6
                md:grid-cols-2
                xl:grid-cols-4
            "
        >

            {cards.map((card) => (

                <div
                    key={card.title}
                    tabIndex={0}
                    onKeyDown={(event) => {

                        if (
                            event.key === "Enter" ||
                            event.key === " "
                        ) {

                            event.preventDefault();

                        }

                    }}
                    className="
                        group
                        rounded-3xl
                        outline-none
                        transition
                        duration-200
                        hover:-translate-y-0.5
                        focus-visible:ring-2
                        focus-visible:ring-blue-500/30
                    "
                >

                    <div className="
                        relative
                        h-full
                    ">

                        <StatCard
                            title={card.title}
                            value={card.value}
                            subtitle={card.subtitle}
                            icon={card.icon}
                            color={card.color}
                        />

                    </div>

                </div>

            ))}

        </div>
    );
}