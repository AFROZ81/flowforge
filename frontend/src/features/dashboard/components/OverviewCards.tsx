import {
    FolderKanban,
    KanbanSquare,
    ListChecks,
    TrendingUp,
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import { SkeletonStatCard } from "@/components/ui/skeleton";
import { ErrorStateBlock } from "@/components/ui/error-state";
import { cn } from "@/lib/utils";

import { useDashboardOverview } from "../hooks/useDashboardOverview";

/**
 * Four headline counts. Subtitles carry the *secondary* numbers rather than
 * repeating the label, which the previous version did ("Projects / Projects").
 */
export default function OverviewCards() {
    const { data, isLoading, error, refetch } = useDashboardOverview();

    if (error) {
        return (
            <ErrorStateBlock
                error={error}
                title="We couldn't load your workspace overview"
                description="Your projects and work items are unaffected — reloading usually fixes this."
                action={
                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="h-9 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                        Try again
                    </button>
                }
            />
        );
    }

    const overview = data?.data;

    const cards = overview
        ? [
              {
                  title: "Projects",
                  value: overview.totalProjects,
                  subtitle: `${overview.totalBoards} board${overview.totalBoards === 1 ? "" : "s"} across them`,
                  icon: FolderKanban,
                  color: "indigo" as const,
              },
              {
                  title: "Boards",
                  value: overview.totalBoards,
                  subtitle: "Kanban surfaces",
                  icon: KanbanSquare,
                  color: "emerald" as const,
              },
              {
                  title: "Work Items",
                  value: overview.totalWorkItems,
                  subtitle: `${overview.activeWorkItems} active · ${overview.blockedWorkItems} blocked`,
                  icon: ListChecks,
                  color: "amber" as const,
              },
              {
                  title: "Completion",
                  value: `${overview.completionPercentage}%`,
                  subtitle: `${overview.completedWorkItems} of ${overview.totalWorkItems} done`,
                  icon: TrendingUp,
                  color: "purple" as const,
              },
          ]
        : [];

    return (
        <div
            className={cn(
                "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
                "xl:gap-5"
            )}
        >
            {isLoading || !overview
                ? Array.from({ length: 4 }).map((_, index) => (
                      <SkeletonStatCard key={index} />
                  ))
                : cards.map((card) => (
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
