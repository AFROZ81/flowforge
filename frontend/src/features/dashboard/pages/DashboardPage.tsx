import { CircleAlert, RefreshCw } from "lucide-react";

import AppLayout from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { normalizeError } from "@/lib/errors";

import DashboardHeader from "../components/DashboardHeader";
import DashboardSkeleton from "../components/DashboardSkeleton";
import NeedsAttention from "../components/NeedsAttention";
import MyOpenWork from "../components/MyOpenWork";
import ProjectHealthPanel from "../components/ProjectHealthPanel";
import TeamWorkload from "../components/TeamWorkload";
import ThroughputChart from "../components/ThroughputChart";
import StatusMixPanel from "../components/StatusMixPanel";
import PriorityMixChart from "../components/PriorityMixChart";
import RecentlyUpdated from "../components/RecentlyUpdated";

import { useDashboardSnapshot } from "../hooks/useDashboardSnapshot";

/**
 * Dashboard.
 *
 * Two columns, in three deliberately level rows.
 *
 * The page used to give every section the full width, so a table with one row in
 * it took the same room as one with eight and the whole thing read as a report
 * rather than a dashboard. Two columns fixed that; letting each column find its
 * own height did not, because the columns ended wherever their content happened
 * to stop and the shorter one trailed a slab of background beside the other -
 * and because the one card told to absorb the difference was a chart, which
 * grew into columns fifteen pixels wide.
 *
 * So the pairing is decided rather than emergent. Each row is a definite height
 * from styles/theme.css that both of its cards fill: My open work against the
 * status and priority charts stacked, the portfolio bars against the workload
 * bars, throughput against the activity feed. Content that overflows scrolls
 * inside its card; nothing grows the row, so nothing can unlevel it.
 *
 * One snapshot, so every figure on screen describes the same instant. A failed
 * refresh keeps the stale numbers with a warning rather than blanking the page,
 * because last-known figures that are labelled as such beat nothing at all.
 */
export default function DashboardPage() {
    const { data, isPending, isFetching, error, refetch } = useDashboardSnapshot();

    const failure = error ? normalizeError(error) : null;

    return (
        <AppLayout>
            <div className="flex flex-col gap-(--dashboard-gap)">
                <DashboardHeader
                    generatedAtUtc={data?.generatedAtUtc ?? null}
                    isFetching={isFetching}
                    onRefresh={() => void refetch()}
                />

                {failure ? (
                    <div
                        role="alert"
                        className="flex flex-wrap items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                    >
                        <CircleAlert className="size-4 shrink-0" />
                        <span className="min-w-0 flex-1">
                            <span className="font-medium">{failure.title}</span>{" "}
                            {failure.description}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void refetch()}
                        >
                            <RefreshCw />
                            Retry
                        </Button>
                    </div>
                ) : null}

                {isPending ? (
                    <DashboardSkeleton />
                ) : data ? (
                    <div className="grid gap-(--dashboard-gap)">
                        <NeedsAttention summary={data.myWork} />

                        {/*
                         * The split is 2:1 and deliberate at xl only: two thirds
                         * of a 1280px viewport's content column is 646px, which
                         * is just wide enough for the work table's 38rem floor.
                         * Below that the page is one column, the fixed heights
                         * are dropped and each card is capped on its own instead.
                         */}
                        <div className="grid gap-(--dashboard-gap) xl:h-(--dashboard-row-work) xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                            <MyOpenWork
                                items={data.myOpenItems}
                                total={data.myWork.open}
                            />

                            {/* Two charts stacked to make one side of the row.
                                The mix keeps the height its three rows need and
                                the ring takes what is left, which is why the
                                pair together match the queue beside them.

                                min-h-0 because this is a grid item holding two
                                cards of its own: without it the pair's minimum
                                height can outgrow the row, and the overflow eats
                                the gap beneath it while the gap beside it stays
                                as specified - which is what made the vertical
                                rhythm look tighter than the horizontal one. */}
                            <div className="flex min-h-0 min-w-0 flex-col gap-(--dashboard-gap)">
                                <StatusMixPanel mix={data.statusMix} />

                                <PriorityMixChart mix={data.priorityMix} />
                            </div>
                        </div>

                        <div className="grid gap-(--dashboard-gap) xl:h-(--dashboard-row-portfolio) xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                            <ProjectHealthPanel
                                projects={data.projectHealth}
                                projectCount={data.projectCount}
                            />

                            <TeamWorkload members={data.teamWorkload} />
                        </div>

                        <div className="grid gap-(--dashboard-gap) xl:h-(--dashboard-row-activity) xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                            <ThroughputChart points={data.throughput} />

                            <RecentlyUpdated
                                items={data.recentlyUpdated}
                            />
                        </div>
                    </div>
                ) : null}
            </div>
        </AppLayout>
    );
}
