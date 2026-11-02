import { useId } from "react";
import {
    Bell,
    CheckCheck,
    RefreshCw,
} from "lucide-react";

import NotificationItem from "./NotificationItem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    PopoverContent,
    PopoverDescription,
    PopoverTitle,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import type { Notification } from "../types/notification";


type Props = {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    isRefreshing: boolean;
    onRefresh: () => void;
    onRead: (notificationId: string) => void;
    onUnread: (notificationId: string) => void;
    onReadAll: () => void;
    onDelete: (notificationId: string) => void;
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

    const titleId = useId();

    return (
        <PopoverContent
            id={titleId}
            className="w-[min(23rem,calc(100vw-1.5rem))] flex flex-col p-0"
        >
            {/* The popover needs an accessible name; the visible heading is it */}
            <PopoverTitle className="sr-only">
                Notifications
            </PopoverTitle>

            <PopoverDescription className="sr-only">
                {unreadCount > 0
                    ? `${unreadCount} unread`
                    : "All read"}
            </PopoverDescription>

            {/* ================= header ================= */}
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">

                <div className="min-w-0">

                    <div className="flex items-center gap-2">

                        <Bell
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                        />

                        <h3 className="truncate text-sm font-semibold text-foreground">
                            Notifications
                        </h3>

                        {unreadCount > 0 && (
                            <span className="shrink-0 rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-semibold text-primary tabular-nums">
                                {unreadCount} unread
                            </span>
                        )}

                    </div>

                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Activity across your workspace
                    </p>

                </div>

                <div className="flex shrink-0 items-center gap-1">

                    {unreadCount > 0 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={onReadAll}
                        >
                            <CheckCheck />
                            Mark all read
                        </Button>
                    )}

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        title="Refresh"
                        aria-label="Refresh notifications"
                        disabled={isRefreshing}
                        onClick={onRefresh}
                    >
                        <RefreshCw
                            className={cn(isRefreshing && "animate-spin")}
                        />
                    </Button>

                </div>

            </div>


            {/* ================= list ================= */}
            <div
                className="max-h-[min(28rem,65dvh)] overflow-y-auto overscroll-contain"
                aria-busy={isLoading}
            >

                {isLoading && (
                    <ul>
                        {Array.from({ length: 4 }).map((_, index) => (
                            <li
                                key={index}
                                className="flex gap-3 border-b border-border-subtle px-3.5 py-3 last:border-b-0"
                            >
                                <span className="w-1.5 shrink-0" />

                                <Skeleton className="size-8 rounded-full" />

                                <div className="min-w-0 flex-1 space-y-2">
                                    <Skeleton className="h-3.5 w-3/5" />
                                    <Skeleton className="h-3 w-4/5 opacity-70" />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}


                {!isLoading && notifications.length === 0 && (
                    <div className="flex min-h-[13rem] flex-col items-center justify-center px-6 text-center">

                        <span
                            aria-hidden="true"
                            className="mb-3 flex size-11 items-center justify-center rounded-full bg-surface-sunken text-muted-foreground"
                        >
                            <Bell className="size-5" />
                        </span>

                        <p className="text-sm font-medium text-foreground">
                            You&rsquo;re all caught up
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            New activity on your work items will appear here.
                        </p>

                    </div>
                )}


                {!isLoading && notifications.length > 0 && (
                    <ul>
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onRead={onRead}
                                onUnread={onUnread}
                                onDelete={onDelete}
                            />
                        ))}
                    </ul>
                )}

            </div>

        </PopoverContent>
    );
}
