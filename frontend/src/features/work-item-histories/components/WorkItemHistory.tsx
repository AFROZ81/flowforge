import {
    useWorkItemHistory,
} from "../hooks/useWorkItemHistory";

import OnlineIndicator from "@/features/presence/components/OnlineIndicator";

type OrganizationUser = {
    id: string;
    fullName: string;
    email?: string | null;
};

type Props = {
    workItemId: string;
    users?: OrganizationUser[];
};

function getActionLabel(
    action: number
) {
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

function getActionStyle(
    action: number
) {
    switch (action) {
        case 7:
            return {
                dot: "bg-success",
                badge:
                    "bg-success-subtle text-success-foreground border-success/40",
            };

        case 8:
            return {
                dot: "bg-danger",
                badge:
                    "bg-danger-subtle text-danger-foreground border-danger/40",
            };

        case 9:
            return {
                dot: "bg-primary",
                badge:
                    "bg-primary-subtle text-primary-hover border-primary-muted",
            };

        case 10:
            return {
                dot: "bg-muted-foreground",
                badge:
                    "bg-surface-muted text-foreground/90 border-border",
            };

        case 11:
            return {
                dot: "bg-brand-indigo",
                badge:
                    "bg-brand-indigo-subtle text-brand-indigo border-brand-indigo/40",
            };

        case 4:
        case 5:
        case 6:
            return {
                dot: "bg-brand-indigo",
                badge:
                    "bg-brand-indigo-subtle text-brand-indigo border-brand-indigo/40",
            };

        case 3:
            return {
                dot: "bg-warning",
                badge:
                    "bg-warning-subtle text-warning-foreground border-warning/40",
            };

        case 2:
            return {
                dot: "bg-muted-foreground",
                badge:
                    "bg-surface-muted text-foreground/90 border-border",
            };

        case 1:
        default:
            return {
                dot: "bg-success",
                badge:
                    "bg-success-subtle text-success-foreground border-success/40",
            };
    }
}

function formatDate(
    value: string
) {
    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}

export default function WorkItemHistory({
    workItemId,
    users = [],
}: Props) {
    const {
        data: history = [],
        isLoading,
        isError,
    } =
        useWorkItemHistory(
            workItemId
        );

    if (isLoading) {
        return (
            <div className="
                rounded-lg
                border
                p-4
                text-sm
                text-muted-foreground
            ">
                Loading activity...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="
                rounded-lg
                border
                border-danger/40
                bg-danger-subtle
                p-4
                text-sm
                text-danger-foreground
            ">
                Failed to load activity history.
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="
                rounded-lg
                border
                p-4
                text-center
                text-sm
                text-muted-foreground
            ">
                No activity yet.
            </div>
        );
    }

    return (
        <div className="
            max-h-72
            overflow-y-auto
            overflow-x-clip
            [overflow-clip-margin:0.5rem]
            pr-2
        ">
            <div className="
                relative
                space-y-0
            ">
                {history.map(
                    (entry, index) => {
                        const user =
                            users.find(
                                (item) =>
                                    item.id ===
                                    entry.userId
                            );

                        const userName =
                            user?.fullName ??
                            "Unknown user";

                        const styles =
                            getActionStyle(
                                entry.action
                            );

                        const isLast =
                            index ===
                            history.length - 1;

                        return (
                            <div
                                key={
                                    entry.id
                                }
                                className="
                                    relative
                                    flex
                                    gap-3
                                "
                            >
                                {/* Timeline */}

                                <div className="
                                    relative
                                    flex
                                    w-5
                                    shrink-0
                                    justify-center
                                ">
                                    {!isLast && (
                                        <div className="
                                            absolute
                                            top-3
                                            bottom-0
                                            w-px
                                            bg-border
                                        " />
                                    )}

                                    <div
                                        className={`
                                            relative
                                            z-10
                                            mt-2
                                            h-2.5
                                            w-2.5
                                            rounded-full
                                            ring-4
                                            ring-background
                                            ${styles.dot}
                                        `}
                                    />
                                </div>

                                {/* Activity */}

                                <div className="
                                    min-w-0
                                    flex-1
                                    pb-4
                                ">
                                    <div className="
                                        rounded-lg
                                        border
                                        bg-background
                                        px-3
                                        py-2.5
                                    ">
                                        <div className="
                                            flex
                                            flex-wrap
                                            items-center
                                            gap-x-2
                                            gap-y-1
                                        ">
                                            {/* ACTOR */}

                                            <div className="
                                                flex
                                                min-w-0
                                                items-center
                                                gap-1.5
                                            ">
                                                <span className="
                                                    truncate
                                                    text-sm
                                                    font-medium
                                                ">
                                                    {
                                                        userName
                                                    }
                                                </span>

                                                {user?.id && (
                                                    <OnlineIndicator
                                                        userId={
                                                            user.id
                                                        }
                                                    />
                                                )}
                                            </div>

                                            {/* ACTION */}

                                            <span
                                                className={`
                                                    rounded-full
                                                    border
                                                    px-2
                                                    py-0.5
                                                    text-[10px]
                                                    font-medium
                                                    ${styles.badge}
                                                `}
                                            >
                                                {
                                                    getActionLabel(
                                                        entry.action
                                                    )
                                                }
                                            </span>
                                        </div>

                                        {entry.description && (
                                            <p className="
                                                mt-1.5
                                                text-xs
                                                leading-relaxed
                                                text-muted-foreground
                                            ">
                                                {
                                                    entry.description
                                                }
                                            </p>
                                        )}

                                        <p className="
                                            mt-1.5
                                            text-[10px]
                                            text-muted-foreground
                                        ">
                                            {
                                                formatDate(
                                                    entry.createdAt
                                                )
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
}