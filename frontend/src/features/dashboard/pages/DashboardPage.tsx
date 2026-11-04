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
import RecentlyUpdated from "../components/RecentlyUpdated";

import { useDashboardSnapshot } from "../hooks/useDashboardSnapshot";

/**
 * Dashboard.
 *
 * Two columns, not six stacked bands. The page used to give every section the
 * full width, so a table with one row in it took the same room as one with
 * eight and the whole thing read as a report rather than a dashboard. What
 * needs width - the personal list, the portfolio table, the chart - takes a
 * main column; what reads as rows of name-against-quantity sits in a rail
 * beside it.
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
            <div className="flex flex-col gap-5 lg:gap-6">
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
                    <div className="space-y-5 lg:space-y-6">
                        <NeedsAttention summary={data.myWork} />

                        <div className="grid gap-5 lg:gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                            {/*
                              The split is deliberately 2:1 and deliberately only
                              at xl. Two thirds of a 1280px viewport's content
                              column is 646px, which is just wide enough for the
                              two tables' 40rem floor; below that the rail would
                              force them to pan inside their own cards, so the
                              page stays one column and the cards get the width
                              their content wants.

                              The columns stretch rather than start-aligning. Two
                              independent columns always end at different
                              heights, and whichever one lost left a slab of
                              background beside the other's last card - first on
                              the right when the list was unbounded, then on the
                              left once it was capped. The chart card takes up
                              the slack, because it is the one element here that
                              gains from being taller instead of looking empty.
                            */}
                            <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
                                <MyOpenWork
                                    items={data.myOpenItems}
                                    total={data.myWork.open}
                                />

                                <ProjectHealthPanel
                                    projects={data.projectHealth}
                                    projectCount={data.projectCount}
                                />

                                <ThroughputChart points={data.throughput} />
                            </div>

                            <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
                                <StatusMixPanel mix={data.statusMix} />

                                <TeamWorkload members={data.teamWorkload} />

                                <RecentlyUpdated
                                    items={data.recentlyUpdated}
                                />
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </AppLayout>
    );
}
