import { useMemo } from "react";
import { BarChart3 } from "lucide-react";

import { useWorkItemDistribution } from "../hooks/useWorkItemDistribution";

type PriorityItem = {
    name: string;
    count: number;
    percentage: number;
};

function getPriorityClass(name: string) {
    const value = name.toLowerCase();

    if (value.includes("critical")) {
        return {
            dot: "bg-red-500",
            bar: "bg-red-500",
            text: "text-red-600",
        };
    }

    if (value.includes("high")) {
        return {
            dot: "bg-orange-500",
            bar: "bg-orange-500",
            text: "text-orange-600",
        };
    }

    if (value.includes("medium")) {
        return {
            dot: "bg-yellow-500",
            bar: "bg-yellow-500",
            text: "text-yellow-600",
        };
    }

    if (value.includes("low")) {
        return {
            dot: "bg-green-500",
            bar: "bg-green-500",
            text: "text-green-600",
        };
    }

    return {
        dot: "bg-blue-500",
        bar: "bg-blue-500",
        text: "text-blue-600",
    };
}

export default function PriorityDistribution() {
    const {
        data,
        isLoading,
        isError,
    } = useWorkItemDistribution();

    const priorities = useMemo<PriorityItem[]>(() => {
        return data?.data?.byPriority ?? [];
    }, [data]);

    const total = useMemo(() => {
        return priorities.reduce(
            (sum, item) => sum + item.count,
            0
        );
    }, [priorities]);

    return (
        <section className="
            rounded-2xl
            border
            bg-background
            p-6
            shadow-sm
        ">

            {/* Header */}

            <div className="
                mb-6
                flex
                items-start
                justify-between
            ">

                <div>

                    <h2 className="
                        text-base
                        font-semibold
                        tracking-tight
                    ">
                        Priority Distribution
                    </h2>

                    <p className="
                        mt-1
                        text-sm
                        text-muted-foreground
                    ">
                        Work items grouped by priority
                    </p>

                </div>

                <div className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-orange-50
                    text-orange-500
                ">
                    <BarChart3 className="
                        h-5
                        w-5
                    " />
                </div>

            </div>


            {/* Loading */}

            {isLoading && (
                <div className="space-y-5">

                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="space-y-2"
                        >
                            <div className="
                                flex
                                items-center
                                justify-between
                            ">
                                <div className="
                                    h-4
                                    w-24
                                    animate-pulse
                                    rounded
                                    bg-muted
                                />

                                <div className="
                                    h-4
                                    w-12
                                    animate-pulse
                                    bg-muted
                                />
                            </div>

                            <div className="
                                h-2
                                w-full
                                animate-pulse
                                rounded-full
                                bg-muted
                            " />
                        </div>
                    ))}

                </div>
            )}


            {/* Error */}

            {isError && !isLoading && (
                <div className="
                    flex
                    min-h-[180px]
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-dashed
                    text-sm
                    text-muted-foreground
                ">
                    Failed to load priority data.
                </div>
            )}


            {/* Empty */}

            {!isLoading &&
                !isError &&
                priorities.length === 0 && (
                    <div className="
                        flex
                        min-h-[180px]
                        flex-col
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-dashed
                        text-center
                    ">

                        <BarChart3 className="
                            mb-3
                            h-8
                            w-8
                            text-muted-foreground
                        " />

                        <p className="
                            text-sm
                            font-medium
                        ">
                            No priority data
                        </p>

                        <p className="
                            mt-1
                            text-xs
                            text-muted-foreground
                        ">
                            Work item priority information
                            will appear here.
                        </p>

                    </div>
                )}


            {/* Data */}

            {!isLoading &&
                !isError &&
                priorities.length > 0 && (
                    <div className="
                        space-y-5
                    ">

                        {priorities.map(
                            (item) => {
                                const priority =
                                    getPriorityClass(
                                        item.name
                                    );

                                return (
                                    <div
                                        key={
                                            item.name
                                        }
                                        className="
                                            space-y-2
                                        "
                                    >

                                        <div className="
                                            flex
                                            items-center
                                            justify-between
                                        ">

                                            <div className="
                                                flex
                                                items-center
                                                gap-2
                                            ">

                                                <span
                                                    className={`
                                                        h-2.5
                                                        w-2.5
                                                        rounded-full
                                                        ${priority.dot}
                                                    `}
                                                />

                                                <span className="
                                                    text-sm
                                                    font-medium
                                                ">
                                                    {
                                                        item.name
                                                    }
                                                </span>

                                            </div>

                                            <div className="
                                                flex
                                                items-center
                                                gap-2
                                            ">

                                                <span className="
                                                    text-xs
                                                    text-muted-foreground
                                                ">
                                                    {
                                                        item.count
                                                    }
                                                </span>

                                                <span
                                                    className={`
                                                        min-w-[52px]
                                                        text-right
                                                        text-xs
                                                        font-medium
                                                        ${priority.text}
                                                    `}
                                                >
                                                    {
                                                        item.percentage
                                                    }%
                                                </span>

                                            </div>

                                        </div>


                                        <div className="
                                            h-2
                                            overflow-hidden
                                            rounded-full
                                            bg-muted
                                        ">

                                            <div
                                                className={`
                                                    h-full
                                                    rounded-full
                                                    transition-all
                                                    duration-700
                                                    ${priority.bar}
                                                `}
                                                style={{
                                                    width: `${Math.min(
                                                        Math.max(
                                                            item.percentage,
                                                            0
                                                        ),
                                                        100
                                                    )}%`,
                                                }}
                                            />

                                        </div>

                                    </div>
                                );
                            }
                        )}


                        {/* Total */}

                        <div className="
                            mt-6
                            flex
                            items-center
                            justify-between
                            border-t
                            pt-4
                        ">

                            <span className="
                                text-xs
                                text-muted-foreground
                            ">
                                Total work items
                            </span>

                            <span className="
                                text-sm
                                font-semibold
                            ">
                                {total}
                            </span>

                        </div>

                    </div>
                )}

        </section>
    );
}