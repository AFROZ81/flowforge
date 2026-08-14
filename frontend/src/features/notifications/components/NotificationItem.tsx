import {
    Check,
    MailOpen,
    Trash2,
} from "lucide-react";

import type {
    Notification,
} from "../types/notification";


type Props = {
    notification: Notification;

    onRead: (
        notificationId: string
    ) => void;

    onUnread: (
        notificationId: string
    ) => void;

    onDelete: (
        notificationId: string
    ) => void;
};


function formatNotificationTime(
    createdAt: string
) {
    const date =
        new Date(createdAt);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    const now =
        new Date();

    const difference =
        now.getTime() -
        date.getTime();

    const seconds =
        Math.floor(
            difference / 1000
        );

    const minutes =
        Math.floor(
            seconds / 60
        );

    const hours =
        Math.floor(
            minutes / 60
        );

    const days =
        Math.floor(
            hours / 24
        );

    if (seconds < 60) {
        return "Just now";
    }

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    if (hours < 24) {
        return `${hours}h ago`;
    }

    if (days < 7) {
        return `${days}d ago`;
    }

    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );
}


export default function NotificationItem({
    notification,
    onRead,
    onUnread,
    onDelete,
}: Props) {

    const isUnread =
        !notification.isRead;


    return (
        <div
            className={[
                "group relative flex gap-3 border-b px-4 py-3",
                "transition-colors",
                isUnread
                    ? "bg-blue-50/50"
                    : "bg-background",
                "hover:bg-muted/40",
            ].join(" ")}
        >

            {/* Unread indicator */}

            <div className="flex w-2 shrink-0 justify-center pt-2">

                {isUnread && (
                    <span
                        className="
                            h-2
                            w-2
                            rounded-full
                            bg-blue-600
                        "
                    />
                )}

            </div>


            {/* Notification icon */}

            <div
                className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-muted
                    text-muted-foreground
                "
            >
                <MailOpen
                    className="
                        h-4
                        w-4
                    "
                />
            </div>


            {/* Content */}

            <div className="min-w-0 flex-1">

                <div className="flex items-start justify-between gap-2">

                    <p
                        className={[
                            "text-sm",
                            isUnread
                                ? "font-semibold"
                                : "font-medium",
                        ].join(" ")}
                    >
                        {notification.title}
                    </p>

                    <span
                        className="
                            shrink-0
                            text-[11px]
                            text-muted-foreground
                        "
                    >
                        {formatNotificationTime(
                            notification.createdAt
                        )}
                    </span>

                </div>


                <p
                    className="
                        mt-1
                        line-clamp-2
                        text-xs
                        leading-5
                        text-muted-foreground
                    "
                >
                    {notification.message}
                </p>


                {/* Actions */}

                <div
                    className="
                        mt-2
                        flex
                        items-center
                        gap-3
                        opacity-100
                        transition-opacity
                        sm:opacity-0
                        sm:group-hover:opacity-100
                    "
                >

                    {isUnread ? (
                        <button
                            type="button"
                            className="
                                inline-flex
                                items-center
                                gap-1
                                text-[11px]
                                font-medium
                                text-muted-foreground
                                hover:text-foreground
                            "
                            onClick={() =>
                                onRead(
                                    notification.id
                                )
                            }
                        >
                            <Check
                                className="
                                    h-3
                                    w-3
                                "
                            />

                            Mark as read
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="
                                inline-flex
                                items-center
                                gap-1
                                text-[11px]
                                font-medium
                                text-muted-foreground
                                hover:text-foreground
                            "
                            onClick={() =>
                                onUnread(
                                    notification.id
                                )
                            }
                        >
                            <MailOpen
                                className="
                                    h-3
                                    w-3
                                "
                            />

                            Mark unread
                        </button>
                    )}


                    <button
                        type="button"
                        className="
                            inline-flex
                            items-center
                            gap-1
                            text-[11px]
                            font-medium
                            text-muted-foreground
                            hover:text-destructive
                        "
                        onClick={() =>
                            onDelete(
                                notification.id
                            )
                        }
                    >
                        <Trash2
                            className="
                                h-3
                                w-3
                            "
                        />

                        Delete
                    </button>

                </div>

            </div>

        </div>
    );
}