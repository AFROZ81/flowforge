import { CircleDashed } from "lucide-react";

import { Panel } from "@/components/common/panel";
import {
  DistributionList,
  type DistributionRow,
} from "@/components/common/distribution-list";
import { statusTone } from "@/lib/tone";

import { useWorkItemDistribution } from "../hooks/useWorkItemDistribution";

/**
 * Distribution of work items by state.
 *
 * Was a hand-rolled switch mapping to `emerald-500`/`red-500`/`blue-600`;
 * now it shares the one tone scale the badges and bars use, so "Blocked"
 * is the same red here and on a card.
 */
export default function WorkItemStatus() {
  const { data, isLoading, error, refetch } = useWorkItemDistribution();

  const items = (data?.data?.byStatus ?? []) as DistributionRow[];

  return (
    <Panel
      title="Work Item Status"
      description="Where everything currently stands"
      isLoading={isLoading}
      error={error}
      onRetry={() => void refetch()}
      isEmpty={items.length === 0}
      empty={{
        title: "No work items yet",
        description:
          "Add a work item to a board and its status will show up here.",
        icon: CircleDashed,
      }}
      skeletonHeight="h-40"
    >
      <DistributionList
        items={items}
        toneFor={(name) => statusTone(name)}
      />
    </Panel>
  );
}
