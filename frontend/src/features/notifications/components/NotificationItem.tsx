import {
    Check,
    MailOpen,
    Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";

import type { Notification } from "../types/notification";


type Props = {
    notification: Notification;

    onRead: (notificationId: string) => void;

    onUnread: (notificationId: string) => void;

    onDelete: (notificationId: string) => void;
};


export default function NotificationItem({
    notification,
    onRead,
    onUnread,
    onDelete,
}: Props) {

    const isUnread = !notification.isRead;

    return (
        <li
            className={cn(
                "group relative flex gap-3 border-b border-border-subtle px-3.5 py-3 transition-colors last:border-b-0",
                isUnread
                    ? "bg-primary-subtle/50"
                    : "hover:bg-surface-muted/60"
            )}
        >
            {/* Unread marker — paired with the bold title, never color alone */}
            <span className="flex w-1.5 shrink-0 justify-center pt-2.5">
                {isUnread && (
                    <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-primary"
                    />
                )}
            </span>

            <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-muted-foreground"
            >
                <MailOpen className="size-4" />
            </span>

            <div className="min-w-0 flex-1">

                <div className="flex items-start justify-between gap-2">

                    <p
                        className={cn(
                            "min-w-0 text-[13px] leading-snug",
                            isUnread
                                ? "font-semibold text-foreground"
                                : "font-medium text-foreground/85"
                        )}
                    >
                        {notification.title}

                        {isUnread && (
                            <span className="sr-only"> (unread)</span>
                        )}
                    </p>

                    <time
                        dateTime={notification.createdAt}
                        className="shrink-0 pt-0.5 text-[11px] whitespace-nowrap text-muted-foreground"
                    >
                        {formatRelativeTime(notification.createdAt)}
                    </time>

                </div>


                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {notification.message}
                </p>


                {/*
                 * Always visible rather than hover-revealed. A hover-only
                 * action row is unreachable by keyboard and invisible on
                 * touch, which is exactly where a notification is tapped.
                 */}
                <div className="mt-2 flex items-center gap-1">

                    {isUnread ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="text-muted-foreground"
                            onClick={() => onRead(notification.id)}
                        >
                            <Check />
                            Mark as read
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="text-muted-foreground"
                            onClick={() => onUnread(notification.id)}
                        >
                            <MailOpen />
                            Mark unread
                        </Button>
                    )}


                    <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="text-muted-foreground hover:bg-danger-subtle hover:text-danger-foreground"
                        onClick={() => onDelete(notification.id)}
                    >
                        <Trash2 />
                        Delete
                    </Button>

                </div>

            </div>

        </li>
    );
}
