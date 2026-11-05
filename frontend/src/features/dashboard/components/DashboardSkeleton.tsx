import { Skeleton } from "@/components/ui/skeleton";

/**
 * The loading shape mirrors the finished page exactly, including the three fixed
 * row heights from styles/theme.css, so nothing shifts when the data lands: the
 * same `xl:h-(--dashboard-row-*)` classes are on the same wrappers, which is why
 * the placeholders sit in the same boxes the charts will.
 *
 * A spinner in the middle of an empty screen would make the whole page jump
 * twice, and a skeleton that guessed at the heights would jump once.
 */
export default function DashboardSkeleton() {
    return (
        <div
            role="status"
            aria-label="Loading dashboard"
            className="grid gap-(--dashboard-gap)"
        >
            <div className="space-y-2">
                <Skeleton className="h-3 w-44" />

                <div className="grid gap-3 sm:gap-4 [grid-template-columns:repeat(auto-fit,minmax(10rem,1fr))]">
                    {[0, 1, 2, 3].map((index) => (
                        <div
                            key={index}
                            className="rounded-xl border bg-card px-4 py-3.5 shadow-xs"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="mt-2.5 h-7 w-12" />
                                </div>
                                <Skeleton className="size-8 shrink-0 rounded-lg" />
                            </div>
                            <Skeleton className="mt-3 h-1 w-full rounded-full" />
                            <Skeleton className="mt-2.5 h-2.5 w-24" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Row 1: the queue against the two charts stacked beside it. */}
            <div className="grid gap-(--dashboard-gap) xl:h-(--dashboard-row-work) xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <Block rows={5} />

                <div className="flex min-h-0 min-w-0 flex-col gap-(--dashboard-gap)">
                    <Block rows={3} />
                    <RingBlock />
                </div>
            </div>

            {/* Row 2: portfolio bars against workload bars. */}
            <div className="grid gap-(--dashboard-gap) xl:h-(--dashboard-row-portfolio) xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <Block rows={4} />
                <Block rows={3} />
            </div>

            {/* Row 3: the chart against the activity feed. */}
            <div className="grid gap-(--dashboard-gap) xl:h-(--dashboard-row-activity) xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <ChartBlock />
                <Block rows={4} />
            </div>
        </div>
    );
}

function Block({ rows }: { rows: number }) {
    return (
        <div className="overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center gap-3 border-b px-4 py-3">
                <Skeleton className="size-8 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="mt-1.5 h-2.5 w-24" />
                </div>
            </div>

            {Array.from({ length: rows }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
                >
                    <Skeleton className="h-4 w-2/5" />
                    <Skeleton className="h-4 flex-1 opacity-70" />
                    <Skeleton className="h-4 w-10" />
                </div>
            ))}
        </div>
    );
}

/** The ring and its legend, at the height the donut actually takes. */
function RingBlock() {
    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center gap-3 border-b px-4 py-3">
                <Skeleton className="size-8 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-1.5 h-2.5 w-40" />
                </div>
            </div>

            <div className="flex min-h-[9rem] flex-1 items-center gap-6 px-4 py-4">
                <Skeleton className="size-[132px] shrink-0 rounded-full" />

                <div className="min-w-0 flex-1 space-y-2.5">
                    {[0, 1, 2, 3].map((index) => (
                        <Skeleton key={index} className="h-4 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}

/** The plot area at the height the row leaves for it. */
function ChartBlock() {
    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center gap-3 border-b px-4 py-3">
                <Skeleton className="size-8 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-1.5 h-2.5 w-44" />
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 px-4 py-4">
                <Skeleton className="h-3 w-52 shrink-0" />
                <Skeleton className="min-h-40 flex-1 rounded-md opacity-40" />
            </div>
        </div>
    );
}
