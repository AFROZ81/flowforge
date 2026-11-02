import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Activity,
    Archive,
    CheckCircle2,
    CircleDot,
    Clock3,
    FileEdit,
    MessageCircle,
    Move,
    RotateCcw,
    ShieldAlert,
    UserPlus,
} from "lucide-react";

import {
    Card,
} from "@/components/ui/card";

import {
    getBoards,
} from "@/features/boards/api/board.service";

import {
    getBoardDetails,
} from "@/features/boards/api/boardDetails.service";

import {
    getWorkItemHistory,
} from "@/features/work-item-histories/api/workItemHistory.service";

import {
    useOrganizationUsers,
} from "@/features/work-items/hooks/useOrganizationUsers";


type Props = {
    projectId: string;
};


type OrganizationUser = {
    id: string;
    fullName: string;
    email?: string | null;
};


type ProjectWorkItem = {
    id: string;
    title: string;
    boardName: string;
};


type ActivityEntry = {
    id: string;
    workItemId: string;
    userId: string;
    action: number;
    description: string;
    createdAt: string;
    workItemTitle: string;
    boardName: string;
};


function getActionLabel(
    action: number
): string {

    switch (action) {

        case 1:
            return "created the work item";

        case 2:
            return "updated the work item";

        case 3:
            return "moved the work item";

        case 4:
            return "added a comment";

        case 5:
            return "updated a comment";

        case 6:
            return "deleted a comment";

        case 7:
            return "completed the work item";

        case 8:
            return "blocked the work item";

        case 9:
            return "activated the work item";

        case 10:
            return "archived the work item";

        case 11:
            return "restored the work item";

        default:
            return "performed an action";
    }
}


function getActionIcon(
    action: number
) {

    switch (action) {

        case 1:
            return UserPlus;

        case 2:
            return FileEdit;

        case 3:
            return Move;

        case 4:
        case 5:
        case 6:
            return MessageCircle;

        case 7:
            return CheckCircle2;

        case 8:
            return ShieldAlert;

        case 9:
            return CircleDot;

        case 10:
            return Archive;

        case 11:
            return RotateCcw;

        default:
            return Activity;
    }
}


function getActionColor(
    action: number
): string {

    switch (action) {

        case 7:
            return `
                bg-success-subtle
                text-success-foreground
            `;

        case 8:
            return `
                bg-danger-subtle
                text-danger-foreground
            `;

        case 9:
            return `
                bg-primary-subtle
                text-primary
            `;

        case 10:
            return `
                bg-surface-sunken
                text-muted-foreground
            `;

        case 11:
            return `
                bg-brand-indigo-subtle
                text-brand-indigo
            `;

        case 4:
        case 5:
        case 6:
            return `
                bg-brand-indigo-subtle
                text-brand-indigo
            `;

        case 3:
            return `
                bg-warning-subtle
                text-warning-foreground
            `;

        case 2:
            return `
                bg-surface-muted
                text-muted-foreground
            `;

        case 1:
        default:
            return `
                bg-success-subtle
                text-success-foreground
            `;
    }
}


function formatRelativeTime(
    value: string
): string {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }


    const now =
        Date.now();


    const difference =
        now -
        date.getTime();


    const seconds =
        Math.floor(
            difference /
            1000
        );


    if (
        seconds < 60
    ) {

        return "Just now";
    }


    const minutes =
        Math.floor(
            seconds /
            60
        );


    if (
        minutes < 60
    ) {

        return `${minutes}m ago`;
    }


    const hours =
        Math.floor(
            minutes /
            60
        );


    if (
        hours < 24
    ) {

        return `${hours}h ago`;
    }


    const days =
        Math.floor(
            hours /
            24
        );


    if (
        days < 7
    ) {

        return `${days}d ago`;
    }


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}


export default function RecentActivity({
    projectId,
}: Props) {

    const [
        activities,
        setActivities,
    ] =
        useState<ActivityEntry[]>(
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


    const {
        data: users = [],
    } =
        useOrganizationUsers();


    useEffect(() => {

        let cancelled = false;


        const loadActivity =
            async () => {

                if (!projectId) {
                    return;
                }


                try {

                    setLoading(
                        true
                    );

                    setError(
                        false
                    );


                    /*
                     * ==========================================
                     * LOAD PROJECT BOARDS
                     * ==========================================
                     */

                    const boards =
                        await getBoards(
                            projectId
                        );


                    /*
                     * ==========================================
                     * LOAD BOARD DETAILS
                     * ==========================================
                     */

                    const boardDetails =
                        await Promise.all(
                            boards.map(
                                board =>
                                    getBoardDetails(
                                        board.id
                                    )
                            )
                        );


                    /*
                     * ==========================================
                     * COLLECT ALL WORK ITEMS
                     * ==========================================
                     */

                    const workItems:
                        ProjectWorkItem[] =
                        [];


                    for (
                        const board
                        of boardDetails
                    ) {

                        for (
                            const column
                            of board.columns ??
                            []
                        ) {

                            for (
                                const workItem
                                of column.workItems ??
                                []
                            ) {

                                workItems.push({
                                    id:
                                        workItem.id,

                                    title:
                                        workItem.title,

                                    boardName:
                                        board.name,
                                });
                            }
                        }
                    }


                    /*
                     * ==========================================
                     * LOAD HISTORY FOR EACH WORK ITEM
                     *
                     * The existing activity API is scoped
                     * to a Work Item, so we aggregate it here.
                     * ==========================================
                     */

                    const historyResults =
                        await Promise.all(
                            workItems.map(
                                async workItem => {

                                    try {

                                        const history =
                                            await getWorkItemHistory(
                                                workItem.id
                                            );


                                        return history.map(
                                            entry => ({
                                                id:
                                                    entry.id,

                                                workItemId:
                                                    workItem.id,

                                                userId:
                                                    entry.userId,

                                                action:
                                                    Number(
                                                        entry.action
                                                    ),

                                                description:
                                                    entry.description,

                                                createdAt:
                                                    entry.createdAt,

                                                workItemTitle:
                                                    workItem.title,

                                                boardName:
                                                    workItem.boardName,
                                            })
                                        );

                                    } catch (
                                        historyError
                                    ) {

                                        console.error(
                                            `Failed to load history for work item ${workItem.id}:`,
                                            historyError
                                        );


                                        return [];
                                    }
                                }
                            )
                        );


                    if (
                        cancelled
                    ) {
                        return;
                    }


                    const merged =
                        historyResults
                            .flat()
                            .sort(
                                (
                                    a,
                                    b
                                ) =>
                                    new Date(
                                        b.createdAt
                                    ).getTime() -
                                    new Date(
                                        a.createdAt
                                    ).getTime()
                            )
                            .slice(
                                0,
                                8
                            );


                    setActivities(
                        merged
                    );

                } catch (
                    loadError
                ) {

                    if (
                        cancelled
                    ) {
                        return;
                    }


                    console.error(
                        "Failed to load project activity:",
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


        void loadActivity();


        return () => {

            cancelled = true;

        };

    }, [
        projectId,
    ]);


    const userMap =
        useMemo(
            () => {

                const map =
                    new Map<
                        string,
                        OrganizationUser
                    >();


                for (
                    const user
                    of users
                ) {

                    map.set(
                        user.id,
                        user
                    );
                }


                return map;

            },
            [
                users,
            ]
        );


    return (
        <Card
            className="
                h-full
                rounded-xl
                shadow-xs
            "
        >

            {/* ==========================================
                HEADER
            =========================================== */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    gap-3
                "
            >

                <div>

                    <h2
                        className="
                            font-heading text-sm
                            font-semibold
                            tracking-[-0.01em]
                            text-foreground
                        "
                    >
                        Recent Activity
                    </h2>


                    <p
                        className="
                            mt-0.5
                            text-xs
                            text-muted-foreground
                        "
                    >
                        Latest changes across this project.
                    </p>

                </div>


                <Activity
                    className="
                        size-4 shrink-0
                        text-muted-foreground
                    "
                    aria-hidden="true"
                />

            </div>


            {/* ==========================================
                LOADING
            =========================================== */}

            {loading && (

                <div
                    className="
                        mt-8
                        space-y-4
                    "
                >

                    {[
                        1,
                        2,
                        3,
                    ].map(
                        item => (

                            <div
                                key={
                                    item
                                }
                                className="
                                    flex
                                    animate-pulse
                                    items-center
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        h-9
                                        w-9
                                        rounded-full
                                        bg-muted
                                    "
                                />


                                <div
                                    className="
                                        flex-1
                                    "
                                >

                                    <div
                                        className="
                                            h-3
                                            w-3/4
                                            rounded
                                            bg-muted
                                        "
                                    />


                                    <div
                                        className="
                                            mt-2
                                            h-2
                                            w-1/3
                                            rounded
                                            bg-muted
                                        "
                                    />

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}


            {/* ==========================================
                ERROR
            =========================================== */}

            {!loading &&
                error && (

                    <div
                        className="
                            mt-6
                            rounded-xl
                            border
                            border-danger/40
                            bg-danger-subtle
                            p-4
                            text-sm
                            text-danger-foreground
                        "
                    >
                        Failed to load recent activity.
                    </div>

                )}


            {/* ==========================================
                EMPTY
            =========================================== */}

            {!loading &&
                !error &&
                activities.length === 0 && (

                    <div
                        className="
                            mt-8
                            flex
                            flex-col
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-dashed
                            py-10
                            text-center
                        "
                    >

                        <Clock3
                            className="
                                mb-3
                                h-6
                                w-6
                                text-muted-foreground
                            "
                        />


                        <p
                            className="
                                text-sm
                                font-medium
                            "
                        >
                            No activity yet.
                        </p>


                        <p
                            className="
                                mt-1
                                text-xs
                                text-muted-foreground
                            "
                        >
                            Activity will appear here as work happens in this project.
                        </p>

                    </div>

                )}


            {/* ==========================================
                ACTIVITY LIST
            =========================================== */}

            {!loading &&
                !error &&
                activities.length > 0 && (

                    <div
                        className="
                            mt-6
                            divide-y
                        "
                    >

                        {activities.map(
                            activity => {

                                const user =
                                    userMap.get(
                                        activity.userId
                                    );


                                const userName =
                                    user?.fullName ??
                                    "Unknown user";


                                const Icon =
                                    getActionIcon(
                                        activity.action
                                    );


                                return (

                                    <div
                                        key={
                                            activity.id
                                        }
                                        className="
                                            flex
                                            gap-3
                                            py-4
                                            first:pt-0
                                            last:pb-0
                                        "
                                    >

                                        <div
                                            className={`
                                                flex
                                                h-9
                                                w-9
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                ${getActionColor(
                                                    activity.action
                                                )}
                                            `}
                                        >

                                            <Icon
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
                                                    text-sm
                                                    leading-5
                                                "
                                            >

                                                <span
                                                    className="
                                                        font-semibold
                                                    "
                                                >
                                                    {
                                                        userName
                                                    }
                                                </span>


                                                {" "}


                                                <span
                                                    className="
                                                        text-muted-foreground
                                                    "
                                                >
                                                    {
                                                        getActionLabel(
                                                            activity.action
                                                        )
                                                    }
                                                </span>


                                                {" "}


                                                <span
                                                    className="
                                                        font-medium
                                                    "
                                                >
                                                    "
                                                    {
                                                        activity.workItemTitle
                                                    }
                                                    "
                                                </span>

                                            </p>


                                            {activity.description && (
                                                <p
                                                    className="
                                                        mt-1
                                                        truncate
                                                        text-xs
                                                        text-muted-foreground
                                                    "
                                                >
                                                    {
                                                        activity.description
                                                    }
                                                </p>
                                            )}


                                            <div
                                                className="
                                                    mt-1
                                                    flex
                                                    items-center
                                                    gap-2
                                                    text-[11px]
                                                    text-muted-foreground
                                                "
                                            >

                                                <span>
                                                    {
                                                        activity.boardName
                                                    }
                                                </span>


                                                <span>
                                                    •
                                                </span>


                                                <span>
                                                    {
                                                        formatRelativeTime(
                                                            activity.createdAt
                                                        )
                                                    }
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

        </Card>
    );
}