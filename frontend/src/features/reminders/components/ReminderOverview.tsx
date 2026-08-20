import {
    useEffect,
    useState,
} from "react";

import {
    AlertCircle,
    Bell,
    CalendarClock,
    Clock3,
    Loader2,
} from "lucide-react";

import {
    getUpcomingReminders,
    getOverdueReminders,
} from "../services/reminder.service";

import type {
    Reminder,
} from "../types/reminder";


type Props = {
    onWorkItemClick?: (
        workItemId: string
    ) => void;
};


type Tab =
    | "upcoming"
    | "overdue";


function formatDate(
    value?: string | null
): string {

    if (!value) {
        return "";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }


    return new Intl.DateTimeFormat(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    ).format(date);
}


function formatDateTime(
    value?: string | null
): string {

    if (!value) {
        return "";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }


    return new Intl.DateTimeFormat(
        undefined,
        {
            day: "2-digit",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
        }
    ).format(date);
}


export default function ReminderOverview({
    onWorkItemClick,
}: Props) {

    const [
        activeTab,
        setActiveTab,
    ] =
        useState<Tab>(
            "upcoming"
        );


    const [
        upcoming,
        setUpcoming,
    ] =
        useState<Reminder[]>(
            []
        );


    const [
        overdue,
        setOverdue,
    ] =
        useState<Reminder[]>(
            []
        );


    const [
        loading,
        setLoading,
    ] =
        useState(true);


    const [
        error,
        setError,
    ] =
        useState(false);


    useEffect(() => {

        let cancelled = false;


        const load =
            async () => {

                try {

                    setLoading(
                        true
                    );

                    setError(
                        false
                    );


                    const [
                        upcomingData,
                        overdueData,
                    ] =
                        await Promise.all([
                            getUpcomingReminders(
                                5
                            ),

                            getOverdueReminders(),
                        ]);


                    if (
                        cancelled
                    ) {
                        return;
                    }


                    setUpcoming(
                        upcomingData
                    );

                    setOverdue(
                        overdueData
                    );

                } catch (loadError) {

                    if (
                        cancelled
                    ) {
                        return;
                    }


                    console.error(
                        "Failed to load reminders:",
                        loadError
                    );


                    setError(
                        true
                    );

                } finally {

                    if (
                        !cancelled
                    ) {

                        setLoading(
                            false
                        );
                    }
                }
            };


        void load();


        return () => {

            cancelled = true;

        };

    }, []);


    const items =
        activeTab === "upcoming"
            ? upcoming
            : overdue;


    return (
        <section
            className="
                rounded-xl
                border
                bg-background
                p-5
                shadow-sm
            "
        >

            {/* ==========================================
                HEADER
            =========================================== */}

            <div
                className="
                    flex
                    items-start
                    justify-between
                    gap-4
                "
            >

                <div>

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <div
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                bg-amber-50
                                text-amber-600
                            "
                        >

                            <Bell
                                className="
                                    h-4
                                    w-4
                                "
                            />

                        </div>


                        <div>

                            <h2
                                className="
                                    text-base
                                    font-semibold
                                "
                            >
                                Reminders
                            </h2>


                            <p
                                className="
                                    text-xs
                                    text-muted-foreground
                                "
                            >
                                Stay on top of upcoming work.
                            </p>

                        </div>

                    </div>

                </div>


                <div
                    className="
                        rounded-full
                        bg-muted
                        px-2.5
                        py-1
                        text-xs
                        font-medium
                    "
                >
                    {upcoming.length +
                        overdue.length}
                </div>

            </div>


            {/* ==========================================
                TABS
            =========================================== */}

            <div
                className="
                    mt-5
                    flex
                    gap-1
                    rounded-lg
                    bg-muted
                    p-1
                "
            >

                <button
                    type="button"
                    className={`
                        flex-1
                        rounded-md
                        px-3
                        py-2
                        text-xs
                        font-medium
                        transition-colors
                        ${
                            activeTab ===
                            "upcoming"
                                ? `
                                    bg-background
                                    shadow-sm
                                `
                                : `
                                    text-muted-foreground
                                    hover:text-foreground
                                `
                        }
                    `}
                    onClick={() =>
                        setActiveTab(
                            "upcoming"
                        )
                    }
                >

                    Upcoming

                    <span
                        className="
                            ml-1.5
                            text-muted-foreground
                        "
                    >
                        {upcoming.length}
                    </span>

                </button>


                <button
                    type="button"
                    className={`
                        flex-1
                        rounded-md
                        px-3
                        py-2
                        text-xs
                        font-medium
                        transition-colors
                        ${
                            activeTab ===
                            "overdue"
                                ? `
                                    bg-background
                                    shadow-sm
                                `
                                : `
                                    text-muted-foreground
                                    hover:text-foreground
                                `
                        }
                    `}
                    onClick={() =>
                        setActiveTab(
                            "overdue"
                        )
                    }
                >

                    Overdue

                    <span
                        className="
                            ml-1.5
                            text-muted-foreground
                        "
                    >
                        {overdue.length}
                    </span>

                </button>

            </div>


            {/* ==========================================
                CONTENT
            =========================================== */}

            <div
                className="
                    mt-4
                "
            >

                {loading && (

                    <div
                        className="
                            flex
                            items-center
                            justify-center
                            py-10
                        "
                    >

                        <Loader2
                            className="
                                h-5
                                w-5
                                animate-spin
                                text-muted-foreground
                            "
                        />

                    </div>

                )}


                {!loading &&
                    error && (

                        <div
                            className="
                                flex
                                flex-col
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-red-200
                                bg-red-50
                                px-4
                                py-8
                                text-center
                            "
                        >

                            <AlertCircle
                                className="
                                    mb-2
                                    h-5
                                    w-5
                                    text-red-500
                                "
                            />


                            <p
                                className="
                                    text-sm
                                    font-medium
                                    text-red-700
                                "
                            >
                                Unable to load reminders.
                            </p>

                        </div>

                    )}


                {!loading &&
                    !error &&
                    items.length === 0 && (

                        <div
                            className="
                                flex
                                flex-col
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-dashed
                                px-4
                                py-9
                                text-center
                            "
                        >

                            <Clock3
                                className="
                                    mb-2
                                    h-5
                                    w-5
                                    text-muted-foreground
                                "
                            />


                            <p
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                {activeTab ===
                                "upcoming"
                                    ? "No upcoming reminders"
                                    : "No overdue reminders"}
                            </p>


                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-muted-foreground
                                "
                            >
                                {activeTab ===
                                "upcoming"
                                    ? "You're all caught up for the next few days."
                                    : "Great — nothing is overdue."}
                            </p>

                        </div>

                    )}


                {!loading &&
                    !error &&
                    items.length > 0 && (

                        <div
                            className="
                                space-y-2
                            "
                        >

                            {items.map(
                                item => (

                                    <button
                                        type="button"
                                        key={
                                            item.workItemId
                                        }
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            p-3
                                            text-left
                                            transition-colors
                                            hover:bg-muted/40
                                        "
                                        onClick={() =>
                                            onWorkItemClick?.(
                                                item.workItemId
                                            )
                                        }
                                    >

                                        <div
                                            className="
                                                flex
                                                items-start
                                                gap-3
                                            "
                                        >

                                            <div
                                                className={`
                                                    mt-0.5
                                                    flex
                                                    h-8
                                                    w-8
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    ${
                                                        activeTab ===
                                                        "overdue"
                                                            ? `
                                                                bg-red-50
                                                                text-red-500
                                                              `
                                                            : `
                                                                bg-amber-50
                                                                text-amber-600
                                                              `
                                                    }
                                                `}
                                            >

                                                <Bell
                                                    className="
                                                        h-4
                                                        w-4
                                                    "
                                                />

                                            </div>


                                            <div
                                                className="
                                                    min-w-0
                                                    flex-1
                                                "
                                            >

                                                <p
                                                    className="
                                                        truncate
                                                        text-sm
                                                        font-medium
                                                    "
                                                >
                                                    {
                                                        item.title
                                                    }
                                                </p>


                                                <div
                                                    className="
                                                        mt-1
                                                        flex
                                                        flex-wrap
                                                        items-center
                                                        gap-x-3
                                                        gap-y-1
                                                        text-xs
                                                        text-muted-foreground
                                                    "
                                                >

                                                    {activeTab ===
                                                        "upcoming" &&
                                                        item.reminderDate && (

                                                            <span
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    gap-1
                                                                "
                                                            >

                                                                <CalendarClock
                                                                    className="
                                                                        h-3
                                                                        w-3
                                                                    "
                                                                />

                                                                {
                                                                    formatDateTime(
                                                                        item.reminderDate
                                                                    )
                                                                }

                                                            </span>

                                                        )}


                                                    <span>

                                                        Due{" "}

                                                        {
                                                            formatDate(
                                                                item.dueDate
                                                            )
                                                        }

                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    </button>

                                )
                            )}

                        </div>

                    )}

            </div>

        </section>
    );
}