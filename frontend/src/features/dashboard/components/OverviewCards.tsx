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

    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

                {Array.from({
                    length: 4,
                }).map((_, index) => (
                    <Card
                        key={index}
                        className="rounded-3xl p-6"
                    >
                        <div className="space-y-4 animate-pulse">

                            <div className="h-4 w-24 rounded bg-slate-200" />

                            <div className="h-8 w-16 rounded bg-slate-200" />

                        </div>

                    </Card>
                ))}

            </div>
        );
    }

    if (error || !data) {
        return (
            <Card className="rounded-3xl p-6">
                Failed to load overview.
            </Card>
        );
    }

    const overview = data.data;

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

    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {cards.map((card) => (
                <StatCard
                    key={card.title}
                    title={card.title}
                    value={card.value}
                    subtitle={card.subtitle}
                    icon={card.icon}
                    color={card.color}
                />
            ))}

        </div>
    );
}