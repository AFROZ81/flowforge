import {
    Bell,
    CheckCheck,
    Loader2,
    RefreshCw,
} from "lucide-react";

import NotificationItem from "./NotificationItem";

import type {
    Notification,
} from "../types/notification";


type Props = {
    notifications: Notification[];

    unreadCount: number;

    isLoading: boolean;

    isRefreshing: boolean;

    onRefresh: () => void;

    onRead: (
        notificationId: string
    ) => void;

    onUnread: (
        notificationId: string
    ) => void;

    onReadAll: () => void;

    onDelete: (
        notificationId: string
    ) => void;
};


export default function NotificationDropdown({
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    onRefresh,
    onRead,
    onUnread,
    onReadAll,
    onDelete,
}: Props) {

    return (
        <div
            className="
                absolute
                right-0
                top-full
                z-50
                mt-2
                w-[380px]
                max-w-[calc(100vw-24px)]
                overflow-hidden
                rounded-xl
                border
                bg-background
                shadow-xl
            "
        >

            {/* Header */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    border-b
                    px-4
                    py-3
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

                        <Bell
                            className="
                                h-4
                                w-4
                            "
                        />

                        <h3
                            className="
                                text-sm
                                font-semibold
                            "
                        >
                            Notifications
                        </h3>


                        {unreadCount > 0 && (
                            <span
                                className="
                                    rounded-full
                                    bg-blue-100
                                    px-2
                                    py-0.5
                                    text-[10px]
                                    font-semibold
                                    text-blue-700
                                "
                            >
                                {unreadCount}
                                {" "}
                                unread
                            </span>
                        )}

                    </div>


                    <p
                        className="
                            mt-0.5
                            text-[11px]
                            text-muted-foreground
                        "
                    >
                        Stay updated with your workspace
                    </p>

                </div>


                <div
                    className="
                        flex
                        items-center
                        gap-1
                    "
                >

                    <button
                        type="button"
                        title="Refresh"
                        disabled={isRefreshing}
                        className="
                            rounded-md
                            p-1.5
                            text-muted-foreground
                            hover:bg-muted
                            hover:text-foreground
                            disabled:opacity-50
                        "
                        onClick={onRefresh}
                    >
                        <RefreshCw
                            className={[
                                "h-4 w-4",
                                isRefreshing
                                    ? "animate-spin"
                                    : "",
                            ].join(" ")}
                        />
                    </button>


                    {unreadCount > 0 && (
                        <button
                            type="button"
                            className="
                                inline-flex
                                items-center
                                gap-1
                                rounded-md
                                px-2
                                py-1.5
                                text-[11px]
                                font-medium
                                text-muted-foreground
                                hover:bg-muted
                                hover:text-foreground
                            "
                            onClick={onReadAll}
                        >
                            <CheckCheck
                                className="
                                    h-3.5
                                    w-3.5
                                "
                            />

                            Mark all read
                        </button>
                    )}

                </div>

            </div>


            {/* Content */}

            <div
                className="
                    max-h-[430px]
                    overflow-y-auto
                "
            >

                {/* Loading */}

                {isLoading && (
                    <div
                        className="
                            flex
                            min-h-[180px]
                            flex-col
                            items-center
                            justify-center
                            gap-2
                            text-sm
                            text-muted-foreground
                        "
                    >
                        <Loader2
                            className="
                                h-5
                                w-5
                                animate-spin
                            "
                        />

                        Loading notifications...
                    </div>
                )}


                {/* Empty */}

                {!isLoading &&
                    notifications.length ===
                        0 && (
                        <div
                            className="
                                flex
                                min-h-[220px]
                                flex-col
                                items-center
                                justify-center
                                px-6
                                text-center
                            "
                        >

                            <div
                                className="
                                    mb-3
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-muted
                                "
                            >
                                <Bell
                                    className="
                                        h-5
                                        w-5
                                        text-muted-foreground
                                    "
                                />
                            </div>


                            <p
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                You're all caught up
                            </p>


                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-muted-foreground
                                "
                            >
                                No notifications to show.
                            </p>

                        </div>
                    )}


                {/* Notifications */}

                {!isLoading &&
                    notifications.length >
                        0 && (
                        <div>

                            {notifications.map(
                                notification => (
                                    <NotificationItem
                                        key={
                                            notification.id
                                        }
                                        notification={
                                            notification
                                        }
                                        onRead={
                                            onRead
                                        }
                                        onUnread={
                                            onUnread
                                        }
                                        onDelete={
                                            onDelete
                                        }
                                    />
                                )
                            )}

                        </div>
                    )}

            </div>


            {/* Footer */}

            {!isLoading &&
                notifications.length >
                    0 && (
                    <div
                        className="
                            border-t
                            px-4
                            py-2
                            text-center
                        "
                    >
                        <button
                            type="button"
                            className="
                                text-xs
                                font-medium
                                text-muted-foreground
                                hover:text-foreground
                            "
                            onClick={
                                onRefresh
                            }
                        >
                            Refresh notifications
                        </button>
                    </div>
                )}

        </div>
    );
}