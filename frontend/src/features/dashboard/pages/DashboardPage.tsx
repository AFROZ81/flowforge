import AppLayout from "@/layouts/AppLayout";

import DashboardHero from "../components/DashboardHero";
import OverviewCards from "../components/OverviewCards";
import WorkItemStatus from "../components/WorkItemStatus";
import CompletionCard from "../components/CompletionCard";
import PriorityDistribution from "../components/PriorityDistribution";
import WorkItemsTrend from "../components/WorkItemsTrend";
import DueWorkItems from "../components/DueWorkItems";
import RecentWorkItems from "../components/RecentWorkItems";


export default function DashboardPage() {

    return (
        <AppLayout>

            <div className="space-y-8">

                {/* =================================================
                    HERO
                   ================================================= */}

                <DashboardHero />


                {/* =================================================
                    OVERVIEW CARDS
                   ================================================= */}

                <OverviewCards />


                {/* =================================================
                    STATUS + PROJECT PROGRESS
                   ================================================= */}

                <div className="
                    grid
                    gap-8
                    xl:grid-cols-2
                ">

                    <WorkItemStatus />

                    <CompletionCard />

                </div>


                {/* =================================================
                    PRIORITY + WORK ITEM TREND
                   ================================================= */}

                <div className="
                    grid
                    gap-8
                    xl:grid-cols-2
                ">

                    <PriorityDistribution />

                    <WorkItemsTrend />

                </div>


                {/* =================================================
                    DUE + RECENT WORK
                   ================================================= */}

                <div className="
                    grid
                    gap-8
                    xl:grid-cols-2
                ">

                    <DueWorkItems />

                    <RecentWorkItems />

                </div>

            </div>

        </AppLayout>
    );
}