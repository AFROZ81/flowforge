import { useMemo } from "react";
import { Scale } from "lucide-react";

import { Panel } from "@/components/common/panel";
import {
  DistributionList,
  type DistributionRow,
} from "@/components/common/distribution-list";
import { priorityTone } from "@/lib/tone";

import { useWorkItemDistribution } from "../hooks/useWorkItemDistribution";

/**
 * Distribution of work items by priority.
 *
 * Shares its query with WorkItemStatus (same key, deduped by React Query)
 * and now shares its row rendering + tone scale with it too — previously
 * the two widgets picked different colors for the same concepts.
 */
export default function PriorityDistribution() {
  const { data, isLoading, error, refetch } = useWorkItemDistribution();

  const priorities = useMemo<DistributionRow[]>(
    () => data?.data?.byPriority ?? [],
    [data]
  );

  const criticalCount = useMemo(
    () =>
      priorities
        .filter((item) => /critical/i.test(item.name))
        .reduce((sum, item) => sum + item.count, 0),
    [priorities]
  );

  return (
    <Panel
      title="Priority Distribution"
      description="How urgently work is stacked"
      isLoading={isLoading}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={priorities.length === 0}
      empty={{
        title: "No priorities set yet",
        description:
          "Set a priority on a work item and the balance between low, medium, high and critical shows up here.",
        icon: Scale,
      }}
      skeletonHeight="h-40"
      action={
        criticalCount > 0 ? (
          <span className="inline-flex h-5 items-center rounded-full border border-danger/20 bg-danger-subtle px-2 text-[11px] font-semibold text-danger-foreground tabular-nums">
            {criticalCount} critical
          </span>
        ) : undefined
      }
    >
      <DistributionList
        items={priorities}
        toneFor={(name) => priorityTone(name)}
      />
    </Panel>
  );
}
