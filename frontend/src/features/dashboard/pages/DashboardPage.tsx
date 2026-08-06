import AppLayout from "@/layouts/AppLayout";

import DashboardHero from "../components/DashboardHero";
import OverviewCards from "../components/OverviewCards";
import WorkItemStatus from "../components/WorkItemStatus";
import CompletionCard from "../components/CompletionCard";

export default function DashboardPage() {
    return (
        <AppLayout>
            <div className="space-y-8">

                <DashboardHero />

                <OverviewCards />

                <div className="grid gap-8 xl:grid-cols-2">
                    <WorkItemStatus />
                    <CompletionCard />
                </div>

            </div>
        </AppLayout>
    );
}