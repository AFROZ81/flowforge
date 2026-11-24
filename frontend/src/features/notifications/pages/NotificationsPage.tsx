import {
    useCallback,
    useMemo,
    useState,
} from "react";

import {
    CircleAlert,
    Loader2,
    RefreshCw,
    Trash2,
    Check,
    Bell,
} from "lucide-react";

import {
    useNotifications,
} from "../hooks/useNotifications";

import {
    Button,
} from "@/components/ui/button";

import {
    EmptyStateCard,
} from "@/components/ui/empty-state";

import {
    PageHeader,
} from "@/components/ui/page-header";

import AppLayout from "@/layouts/AppLayout";

function formatRelativeTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
        return "just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 30) {
        return `${days} day${days > 1 ? "s" : ""} ago`;
    }

    return date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

const NotificationsPage = () => {
    const {
        notifications,
        unreadCount,
        isLoading,
        isRefreshing,
        error,
        refresh,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        remove,
    } = useNotifications();

    const [deleting, setDeleting] = useState<string | null>(null);

    const handleRead = useCallback(
        async (notificationId: string) => {
            try {
                await markAsRead(notificationId);
            } catch (error) {
                console.error(
                    "Failed to mark notification as read:",
                    error
                );
            }
        },
        [markAsRead]
    );

    const handleUnread = useCallback(
        async (notificationId: string) => {
            try {
                await markAsUnread(notificationId);
            } catch (error) {
                console.error(
                    "Failed to mark notification as unread:",
                    error
                );
            }
        },
        [markAsUnread]
    );

    const handleReadAll = useCallback(async () => {
        try {
            await markAllAsRead();
        } catch (error) {
            console.error(
                "Failed to mark all notifications as read:",
                error
            );
        }
    }, [markAllAsRead]);

    const handleDelete = useCallback(
        async (notificationId: string) => {
            setDeleting(notificationId);

            try {
                await remove(notificationId);
            } catch (error) {
                console.error(
                    "Failed to delete notification:",
                    error
                );
            } finally {
                setDeleting(null);
            }
        },
        [remove]
    );

    const handleMarkAllRead = useCallback(() => {
        void handleReadAll();
    }, [handleReadAll]);

    const unreadNotifications =
        useMemo(
            () =>
                notifications.filter(
                    (notification) => !notification.isRead
                ),
            [notifications]
        );

    const readNotifications =
        useMemo(
            () =>
                notifications.filter(
                    (notification) => notification.isRead
                ),
            [notifications]
        );

    return (
        <AppLayout>
            <PageHeader
                title="Notifications"
                actions={
                    <>
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => void refresh()}
                            disabled={isRefreshing}
                        >
                            {isRefreshing ? (
                                <Loader2
                                    className="animate-spin"
                                />
                            ) : (
                                <RefreshCw />
                            )}
                            Refresh
                        </Button>

                        {unreadCount > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="lg"
                                onClick={() => void handleMarkAllRead()}
                            >
                                <Check />
                                Mark all as read
                            </Button>
                        )}
                    </>
                }
            />

            {error && (
                <div
                    role="alert"
                    className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                >
                    <CircleAlert className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1">{error}</span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void refresh()}
                    >
                        Retry
                    </Button>
                </div>
            )}

            <div className="mt-4 flex min-w-0 flex-col gap-5 lg:gap-6">

                {unreadNotifications.length > 0 && (
                    <section className="rounded-xl border bg-card px-4 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-foreground">
                                Unread
                            </h2>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => void handleMarkAllRead()}
                            >
                                Mark all as read
                            </Button>
                        </div>

                        <ul>
                            {unreadNotifications.map(
                                (notification) => (
                                    <li
                                        key={notification.id}
                                        className="flex gap-3 border-b border-border-subtle px-3.5 py-3 last:border-b-0"
                                    >
                                        <span className="flex w-1.5 shrink-0 justify-center pt-2.5">
                                            <span
                                                aria-hidden="true"
                                                className="size-1.5 rounded-full bg-primary"
                                            />
                                        </span>

                                        <span
                                            aria-hidden="true"
                                            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-muted-foreground"
                                        >
                                            <Bell className="size-4" />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p
                                                    className="min-w-0 text-[13px] leading-snug font-semibold text-foreground"
                                                >
                                                    {notification.title}
                                                </p>

                                                <time
                                                    dateTime={
                                                        notification.createdAt
                                                    }
                                                    className="shrink-0 pt-0.5 text-[11px] whitespace-nowrap text-muted-foreground"
                                                >
                                                    {formatRelativeTime(
                                                        notification.createdAt
                                                    )}
                                                </time>
                                            </div>

                                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                {notification.message}
                                            </p>

                                            <div className="mt-2 flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="xs"
                                                    className="text-muted-foreground"
                                                    disabled={
                                                        deleting ===
                                                        notification.id
                                                    }
                                                    onClick={() =>
                                                        void handleRead(
                                                            notification.id
                                                        )
                                                    }
                                                >
                                                    <Check />
                                                    Mark as read
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="xs"
                                                    className="text-muted-foreground hover:bg-danger-subtle hover:text-danger-foreground"
                                                    disabled={
                                                        deleting ===
                                                        notification.id
                                                    }
                                                    onClick={() =>
                                                        void handleDelete(
                                                            notification.id
                                                        )
                                                    }
                                                >
                                                    <Trash2 />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </li>
                                )
                            )}
                        </ul>
                    </section>
                )}

                {readNotifications.length > 0 && (
                    <section className="rounded-xl border bg-card px-4 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-foreground">
                                Read
                            </h2>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void refresh()}
                                disabled={isRefreshing}
                            >
                                {isRefreshing ? (
                                    <Loader2
                                        className="animate-spin"
                                    />
                                ) : (
                                    <RefreshCw />
                                )}
                            </Button>
                        </div>

                        <ul>
                            {readNotifications.map(
                                (notification) => (
                                    <li
                                        key={notification.id}
                                        className="flex gap-3 border-b border-border-subtle px-3.5 py-3 last:border-b-0"
                                    >
                                        <span className="w-1.5 shrink-0" />

                                        <span
                                            aria-hidden="true"
                                            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-muted-foreground"
                                        >
                                            <Bell className="size-4" />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p
                                                    className="min-w-0 text-[13px] leading-snug font-medium text-foreground/85"
                                                >
                                                    {notification.title}
                                                </p>

                                                <time
                                                    dateTime={
                                                        notification.createdAt
                                                    }
                                                    className="shrink-0 pt-0.5 text-[11px] whitespace-nowrap text-muted-foreground"
                                                >
                                                    {formatRelativeTime(
                                                        notification.createdAt
                                                    )}
                                                </time>
                                            </div>

                                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                {notification.message}
                                            </p>

                                            <div className="mt-2 flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="xs"
                                                    className="text-muted-foreground"
                                                    disabled={
                                                        deleting ===
                                                        notification.id
                                                    }
                                                    onClick={() =>
                                                        void handleUnread(
                                                            notification.id
                                                        )
                                                    }
                                                >
                                                    Mark unread
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="xs"
                                                    className="text-muted-foreground hover:bg-danger-subtle hover:text-danger-foreground"
                                                    disabled={
                                                        deleting ===
                                                        notification.id
                                                    }
                                                    onClick={() =>
                                                        void handleDelete(
                                                            notification.id
                                                        )
                                                    }
                                                >
                                                    <Trash2 />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </li>
                                )
                            )}
                        </ul>
                    </section>
                )}

                {notifications.length === 0 && !isLoading && (
                    <EmptyStateCard
                        icon={Bell}
                        size="sm"
                        title="You&rsquo;re all caught up"
                        description={
                            "New activity on your work items will appear here."
                        }
                    />
                )}
            </div>
        </AppLayout>
    );
};

export default NotificationsPage;
