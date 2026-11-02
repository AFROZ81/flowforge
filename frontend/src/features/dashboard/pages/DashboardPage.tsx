import AppLayout from "@/layouts/AppLayout";

import DashboardHero from "../components/DashboardHero";
import OverviewCards from "../components/OverviewCards";
import WorkItemStatus from "../components/WorkItemStatus";
import CompletionCard from "../components/CompletionCard";
import PriorityDistribution from "../components/PriorityDistribution";
import WorkItemsTrend from "../components/WorkItemsTrend";
import DueWorkItems from "../components/DueWorkItems";
import RecentWorkItems from "../components/RecentWorkItems";

import ReminderOverview from "@/features/reminders/components/ReminderOverview";

/**
 * Dashboard.
 *
 * Pairs of panels share a row only once there's room for both — the previous
 * `xl:grid-cols-2` collapsed to a single full-width column below 1280px, which
 * made a laptop view feel unusually tall.
 */
export default function DashboardPage() {
    return (
        <AppLayout>
            <div className="space-y-5 lg:space-y-6">

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
                <div className="grid gap-5 lg:gap-6 md:grid-cols-2">
                    <WorkItemStatus />
                    <CompletionCard />
                </div>


                {/* =================================================
                    PRIORITY + WORK ITEM TREND
                ================================================= */}
                <div className="grid gap-5 lg:gap-6 md:grid-cols-2">
                    <PriorityDistribution />
                    <WorkItemsTrend />
                </div>


                {/* =================================================
                    DUE + REMINDERS
                ================================================= */}
                <div className="grid gap-5 lg:gap-6 xl:grid-cols-2">
                    <DueWorkItems />
                    <ReminderOverview />
                </div>


                {/* =================================================
                    RECENT WORK
                ================================================= */}
                <RecentWorkItems />

            </div>
        </AppLayout>
    );
}
