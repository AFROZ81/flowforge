import { Skeleton } from "@/components/ui/skeleton";

/**
 * The loading shape mirrors the finished page - figure strip, then a main
 * column beside a rail - so nothing shifts when the data lands. A spinner in
 * the middle of an empty screen would make the whole page jump twice.
 */
export default function DashboardSkeleton() {
    return (
        <div
            role="status"
            aria-label="Loading dashboard"
            className="space-y-5 lg:space-y-6"
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

            <div className="grid gap-5 lg:gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
                    <Block rows={6} />
                    <Block rows={4} />
                    <div className="overflow-hidden rounded-xl border bg-card">
                        <div className="border-b px-4 py-3">
                            <Skeleton className="h-4 w-28" />
                        </div>
                        <div className="px-4 py-4">
                            <Skeleton className="h-3 w-52" />
                            <Skeleton className="mt-4 h-40 w-full rounded-md opacity-40" />
                        </div>
                    </div>
                </div>

                <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
                    <Block rows={3} />
                    <Block rows={4} />
                    <Block rows={5} />
                </div>
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
