import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    BarChart3,
    CheckCircle2,
    ChevronDown,
    CirclePlus,
} from "lucide-react";

import { dashboardService } from "../api/dashboard.service";
import type { WorkItemTrendItem } from "../types/dashboard.types";


type TrendRange = 7 | 30 | 90;

interface WorkItemsTrendProps {
    className?: string;
}


const formatDate = (date: string) => {
    const value = new Date(date);

    return value.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
    });
};


const formatTooltipDate = (date: string) => {
    const value = new Date(date);

    return value.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};


export default function WorkItemsTrend({
    className = "",
}: WorkItemsTrendProps) {

    const [range, setRange] = useState<TrendRange>(7);

    const [data, setData] = useState<WorkItemTrendItem[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);


    /*
     * =========================================================
     * LOAD TREND DATA
     * =========================================================
     */

    useEffect(() => {

        let cancelled = false;


        const loadTrend = async () => {

            try {

                setLoading(true);
                setError(null);


                const response =
                    await dashboardService.getWorkItemTrend(range);


                if (cancelled) {
                    return;
                }


                if (!response?.success) {

                    throw new Error(
                        response?.message ||
                        "Failed to load work item trend."
                    );

                }


                setData(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );


            } catch (err) {

                if (cancelled) {
                    return;
                }


                console.error(
                    "Dashboard: failed to load work item trend:",
                    err
                );


                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load work item activity."
                );


                setData([]);

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }

            }

        };


        void loadTrend();


        return () => {
            cancelled = true;
        };

    }, [range]);


    /*
     * =========================================================
     * PREPARE DATA
     * =========================================================
     */

    const chartData = useMemo(() => {

        return data.map((item) => ({
            ...item,
            label: formatDate(item.date),
        }));

    }, [data]);


    /*
     * =========================================================
     * TOTALS
     * =========================================================
     */

    const totalCreated = useMemo(
        () =>
            data.reduce(
                (sum, item) =>
                    sum + item.created,
                0
            ),
        [data]
    );


    const totalCompleted = useMemo(
        () =>
            data.reduce(
                (sum, item) =>
                    sum + item.completed,
                0
            ),
        [data]
    );


    /*
     * =========================================================
     * MAX VALUE
     * =========================================================
     */

    const maxValue = useMemo(() => {

        const highest = chartData.reduce(
            (max, item) =>
                Math.max(
                    max,
                    item.created,
                    item.completed
                ),
            0
        );


        return Math.max(highest, 1);

    }, [chartData]);


    /*
     * =========================================================
     * SVG CHART GEOMETRY
     * =========================================================
     */

    const chartWidth = 720;
    const chartHeight = 230;

    const paddingLeft = 42;
    const paddingRight = 12;
    const paddingTop = 18;
    const paddingBottom = 32;


    const plotWidth =
        chartWidth -
        paddingLeft -
        paddingRight;


    const plotHeight =
        chartHeight -
        paddingTop -
        paddingBottom;


    const getX = (index: number) => {

        if (chartData.length <= 1) {
            return paddingLeft + plotWidth / 2;
        }


        return (
            paddingLeft +
            (index /
                (chartData.length - 1)) *
                plotWidth
        );

    };


    const getY = (value: number) => {

        return (
            paddingTop +
            plotHeight -
            (value / maxValue) *
                plotHeight
        );

    };


    const createdPoints = chartData
        .map(
            (item, index) =>
                `${getX(index)},${getY(item.created)}`
        )
        .join(" ");


    const completedPoints = chartData
        .map(
            (item, index) =>
                `${getX(index)},${getY(item.completed)}`
        )
        .join(" ");


    /*
     * =========================================================
     * AREA PATHS
     * =========================================================
     */

    const createdAreaPath = useMemo(() => {

        if (chartData.length === 0) {
            return "";
        }


        const firstX = getX(0);

        const lastX =
            getX(chartData.length - 1);


        const bottom =
            paddingTop + plotHeight;


        return `
            M ${firstX} ${bottom}
            L ${createdPoints
                .split(" ")
                .map((point) => point.replace(",", " "))
                .join(" L ")}
            L ${lastX} ${bottom}
            Z
        `;

    }, [chartData, createdPoints, plotHeight]);


    const completedAreaPath = useMemo(() => {

        if (chartData.length === 0) {
            return "";
        }


        const firstX = getX(0);

        const lastX =
            getX(chartData.length - 1);


        const bottom =
            paddingTop + plotHeight;


        return `
            M ${firstX} ${bottom}
            L ${completedPoints
                .split(" ")
                .map((point) => point.replace(",", " "))
                .join(" L ")}
            L ${lastX} ${bottom}
            Z
        `;

    }, [chartData, completedPoints, plotHeight]);


    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (
        <section
            className={`
                rounded-2xl
                border
                bg-background
                p-6
                shadow-sm
                ${className}
            `}
        >

            {/* =================================================
                HEADER
               ================================================= */}

            <div className="flex items-start justify-between gap-4">

                <div>

                    <div className="flex items-center gap-3">

                        <div
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-blue-50
                                text-blue-600
                            "
                        >

                            <Activity className="h-4 w-4" />

                        </div>


                        <div>

                            <h2 className="text-base font-semibold">
                                Work Items Trend
                            </h2>

                            <p className="text-xs text-muted-foreground">
                                Created vs completed work items
                            </p>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    RANGE SELECTOR
                   ================================================= */}

                <div className="relative shrink-0">

                    <select
                        value={range}
                        onChange={(event) =>
                            setRange(
                                Number(
                                    event.target.value
                                ) as TrendRange
                            )
                        }
                        className="
                            h-8
                            appearance-none
                            rounded-md
                            border
                            bg-background
                            py-1
                            pl-3
                            pr-8
                            text-xs
                            font-medium
                            outline-none
                            transition
                            focus:ring-2
                            focus:ring-ring
                        "
                    >

                        <option value={7}>
                            Last 7 days
                        </option>

                        <option value={30}>
                            Last 30 days
                        </option>

                        <option value={90}>
                            Last 90 days
                        </option>

                    </select>


                    <ChevronDown
                        className="
                            pointer-events-none
                            absolute
                            right-2
                            top-1/2
                            h-3.5
                            w-3.5
                            -translate-y-1/2
                            text-muted-foreground
                        "
                    />

                </div>

            </div>


            {/* =================================================
                SUMMARY
               ================================================= */}

            {!loading &&
                !error &&
                chartData.length > 0 && (

                    <div className="mt-5 flex flex-wrap items-center gap-6">

                        <div className="flex items-center gap-2">

                            <span className="
                                h-2.5
                                w-2.5
                                rounded-full
                                bg-blue-500
                            " />

                            <span className="text-xs text-muted-foreground">
                                Created
                            </span>

                            <span className="text-sm font-semibold">
                                {totalCreated}
                            </span>

                        </div>


                        <div className="flex items-center gap-2">

                            <span className="
                                h-2.5
                                w-2.5
                                rounded-full
                                bg-emerald-500
                            " />

                            <span className="text-xs text-muted-foreground">
                                Completed
                            </span>

                            <span className="text-sm font-semibold">
                                {totalCompleted}
                            </span>

                        </div>

                    </div>

                )}


            {/* =================================================
                CHART AREA
               ================================================= */}

            <div className="mt-5 h-[250px]">

                {/* =================================================
                    LOADING
                   ================================================= */}

                {loading && (

                    <div className="
                        flex
                        h-full
                        items-end
                        gap-4
                        px-3
                        pb-6
                    ">

                        {Array.from({
                            length: 7,
                        }).map((_, index) => (

                            <div
                                key={index}
                                className="
                                    flex
                                    flex-1
                                    items-end
                                    justify-center
                                "
                            >

                                <div
                                    className="
                                        h-full
                                        w-full
                                        max-w-[40px]
                                        animate-pulse
                                        rounded-md
                                        bg-muted
                                    "
                                    style={{
                                        opacity:
                                            0.35 +
                                            (index % 3) *
                                                0.15,
                                        height:
                                            `${35 + (index % 4) * 12}%`,
                                    }}
                                />

                            </div>

                        ))}

                    </div>

                )}


                {/* =================================================
                    ERROR
                   ================================================= */}

                {!loading && error && (

                    <div className="
                        flex
                        h-full
                        flex-col
                        items-center
                        justify-center
                        text-center
                    ">

                        <div className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            bg-red-50
                            text-red-500
                        ">

                            <Activity className="h-5 w-5" />

                        </div>


                        <p className="mt-3 text-sm font-medium">
                            Unable to load trend
                        </p>


                        <p className="
                            mt-1
                            max-w-sm
                            text-xs
                            text-muted-foreground
                        ">
                            {error}
                        </p>

                    </div>

                )}


                {/* =================================================
                    EMPTY
                   ================================================= */}

                {!loading &&
                    !error &&
                    chartData.length === 0 && (

                        <div className="
                            flex
                            h-full
                            flex-col
                            items-center
                            justify-center
                            text-center
                        ">

                            <div className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-full
                                bg-muted
                                text-muted-foreground
                            ">

                                <BarChart3 className="h-5 w-5" />

                            </div>


                            <p className="mt-3 text-sm font-medium">
                                No activity yet
                            </p>


                            <p className="
                                mt-1
                                text-xs
                                text-muted-foreground
                            ">
                                Work-item activity will appear here.
                            </p>

                        </div>

                    )}


                {/* =================================================
                    CHART
                   ================================================= */}

                {!loading &&
                    !error &&
                    chartData.length > 0 && (

                        <div className="relative h-full w-full">

                            <svg
                                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                preserveAspectRatio="none"
                                className="
                                    h-full
                                    w-full
                                    overflow-visible
                                "
                            >

                                {/* =================================
                                    DEFINITIONS
                                   ================================= */}

                                <defs>

                                    <linearGradient
                                        id="createdGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >

                                        <stop
                                            offset="0%"
                                            stopColor="#3b82f6"
                                            stopOpacity="0.18"
                                        />

                                        <stop
                                            offset="100%"
                                            stopColor="#3b82f6"
                                            stopOpacity="0"
                                        />

                                    </linearGradient>


                                    <linearGradient
                                        id="completedGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >

                                        <stop
                                            offset="0%"
                                            stopColor="#10b981"
                                            stopOpacity="0.18"
                                        />

                                        <stop
                                            offset="100%"
                                            stopColor="#10b981"
                                            stopOpacity="0"
                                        />

                                    </linearGradient>

                                </defs>


                                {/* =================================
                                    GRID
                                   ================================= */}

                                {[0, 0.25, 0.5, 0.75, 1].map(
                                    (ratio) => {

                                        const y =
                                            paddingTop +
                                            plotHeight *
                                                ratio;


                                        const value =
                                            Math.round(
                                                maxValue *
                                                    (1 - ratio)
                                            );


                                        return (
                                            <g
                                                key={ratio}
                                            >

                                                <line
                                                    x1={
                                                        paddingLeft
                                                    }
                                                    x2={
                                                        chartWidth -
                                                        paddingRight
                                                    }
                                                    y1={y}
                                                    y2={y}
                                                    stroke="currentColor"
                                                    className="
                                                        text-border
                                                    "
                                                    strokeDasharray={
                                                        ratio === 1
                                                            ? undefined
                                                            : "4 4"
                                                    }
                                                    strokeWidth="1"
                                                />


                                                <text
                                                    x={
                                                        paddingLeft -
                                                        8
                                                    }
                                                    y={
                                                        y + 3
                                                    }
                                                    textAnchor="end"
                                                    className="
                                                        fill-muted-foreground
                                                    "
                                                    fontSize="10"
                                                >
                                                    {value}
                                                </text>

                                            </g>
                                        );

                                    }
                                )}


                                {/* =================================
                                    AREA — CREATED
                                   ================================= */}

                                <path
                                    d={createdAreaPath}
                                    fill="url(#createdGradient)"
                                />


                                {/* =================================
                                    AREA — COMPLETED
                                   ================================= */}

                                <path
                                    d={completedAreaPath}
                                    fill="url(#completedGradient)"
                                />


                                {/* =================================
                                    LINE — CREATED
                                   ================================= */}

                                <polyline
                                    points={createdPoints}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />


                                {/* =================================
                                    LINE — COMPLETED
                                   ================================= */}

                                <polyline
                                    points={completedPoints}
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />


                                {/* =================================
                                    DATA POINTS
                                   ================================= */}

                                {chartData.map(
                                    (item, index) => {

                                        const x =
                                            getX(index);

                                        const createdY =
                                            getY(
                                                item.created
                                            );

                                        const completedY =
                                            getY(
                                                item.completed
                                            );


                                        return (
                                            <g
                                                key={item.date}
                                            >

                                                <circle
                                                    cx={x}
                                                    cy={
                                                        createdY
                                                    }
                                                    r="3"
                                                    fill="white"
                                                    stroke="#3b82f6"
                                                    strokeWidth="2"
                                                />


                                                <circle
                                                    cx={x}
                                                    cy={
                                                        completedY
                                                    }
                                                    r="3"
                                                    fill="white"
                                                    stroke="#10b981"
                                                    strokeWidth="2"
                                                />


                                                {/* Date */}
                                                <text
                                                    x={x}
                                                    y={
                                                        chartHeight -
                                                        8
                                                    }
                                                    textAnchor="middle"
                                                    className="
                                                        fill-muted-foreground
                                                    "
                                                    fontSize="10"
                                                >
                                                    {item.label}
                                                </text>

                                            </g>
                                        );

                                    }
                                )}

                            </svg>


                            {/* =================================================
                                TOOLTIP LAYER
                               ================================================= */}

                            <div className="
                                absolute
                                inset-x-0
                                top-0
                                bottom-6
                                flex
                            ">

                                {chartData.map(
                                    (item) => (

                                        <div
                                            key={item.date}
                                            className="
                                                group
                                                relative
                                                flex-1
                                            "
                                        >

                                            <div className="
                                                pointer-events-none
                                                absolute
                                                left-1/2
                                                top-1/2
                                                z-30
                                                hidden
                                                -translate-x-1/2
                                                -translate-y-1/2
                                                whitespace-nowrap
                                                rounded-lg
                                                border
                                                bg-popover
                                                px-3
                                                py-2
                                                text-xs
                                                shadow-lg
                                                group-hover:block
                                            ">

                                                <div className="
                                                    mb-2
                                                    font-semibold
                                                ">
                                                    {formatTooltipDate(
                                                        item.date
                                                    )}
                                                </div>


                                                <div className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                ">

                                                    <span className="
                                                        h-2
                                                        w-2
                                                        rounded-full
                                                        bg-blue-500
                                                    " />

                                                    <span className="
                                                        text-muted-foreground
                                                    ">
                                                        Created
                                                    </span>

                                                    <span className="font-semibold">
                                                        {item.created}
                                                    </span>

                                                </div>


                                                <div className="
                                                    mt-1
                                                    flex
                                                    items-center
                                                    gap-2
                                                ">

                                                    <span className="
                                                        h-2
                                                        w-2
                                                        rounded-full
                                                        bg-emerald-500
                                                    " />

                                                    <span className="
                                                        text-muted-foreground
                                                    ">
                                                        Completed
                                                    </span>

                                                    <span className="font-semibold">
                                                        {item.completed}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    )}

            </div>


            {/* =================================================
                LEGEND
               ================================================= */}

            {!loading &&
                !error &&
                chartData.length > 0 && (

                    <div className="
                        mt-2
                        flex
                        items-center
                        justify-center
                        gap-6
                    ">

                        <div className="
                            flex
                            items-center
                            gap-1.5
                            text-xs
                            text-muted-foreground
                        ">

                            <CirclePlus
                                className="
                                    h-3.5
                                    w-3.5
                                    text-blue-500
                                "
                            />

                            Created

                        </div>


                        <div className="
                            flex
                            items-center
                            gap-1.5
                            text-xs
                            text-muted-foreground
                        ">

                            <CheckCircle2
                                className="
                                    h-3.5
                                    w-3.5
                                    text-emerald-500
                                "
                            />

                            Completed

                        </div>

                    </div>

                )}

        </section>
    );
}