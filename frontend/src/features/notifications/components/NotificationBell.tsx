import { Bell } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverTrigger,
} from "@/components/ui/popover";
import { normalizeError } from "@/lib/errors";

import { useNotifications } from "../hooks/useNotifications";

import NotificationDropdown from "./NotificationDropdown";


/**
 * The bell and its panel.
 *
 * The dropdown used to be an absolutely positioned div with a hand-rolled
 * document mousedown listener, so Escape did nothing and focus stayed
 * behind the trigger. base-ui's Popover owns that now.
 */
export default function NotificationBell() {

    const {
        notifications,
        unreadCount,
        isLoading,
        isRefreshing,
        refresh,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        remove,
    } = useNotifications();


    /* ---------- mark read ---------- */

    const handleRead = async (notificationId: string) => {
        try {
            await markAsRead(notificationId);
        } catch (error) {
            console.error(
                "Failed to mark notification as read:",
                error
            );

            const { title, description } = normalizeError(error, {
                title: "We couldn't mark that as read",
            });

            toast.error(title, { description });
        }
    };


    /* ---------- mark unread ---------- */

    const handleUnread = async (notificationId: string) => {
        try {
            await markAsUnread(notificationId);
        } catch (error) {
            console.error(
                "Failed to mark notification as unread:",
                error
            );

            const { title, description } = normalizeError(error, {
                title: "We couldn't mark that as unread",
            });

            toast.error(title, { description });
        }
    };


    /* ---------- mark all read ---------- */

    const handleReadAll = async () => {
        try {
            await markAllAsRead();

            toast.success("All notifications marked as read.");
        } catch (error) {
            console.error(
                "Failed to mark all notifications as read:",
                error
            );

            const { title, description } = normalizeError(error, {
                title: "We couldn't mark everything as read",
            });

            toast.error(title, { description });
        }
    };


    /* ---------- delete ---------- */

    const handleDelete = async (notificationId: string) => {
        try {
            await remove(notificationId);
        } catch (error) {
            console.error(
                "Failed to delete notification:",
                error
            );

            const { title, description } = normalizeError(error, {
                title: "We couldn't delete that notification",
            });

            toast.error(title, { description });
        }
    };


    return (
        <Popover>
            <PopoverTrigger
                aria-label={
                    unreadCount > 0
                        ? `Notifications, ${unreadCount} unread`
                        : "Notifications"
                }
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative text-muted-foreground hover:text-foreground"
                    />
                }
            >
                <Bell />

                {unreadCount > 0 && (
                    <span
                        aria-hidden="true"
                        className="
                            absolute top-1 right-1 flex min-w-[15px] translate-x-1/3
                            -translate-y-1/3 items-center justify-center rounded-full
                            bg-danger px-1 text-[9px] leading-none font-bold text-white
                            ring-2 ring-card tabular-nums
                        "
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </PopoverTrigger>

            <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                isLoading={isLoading}
                isRefreshing={isRefreshing}
                onRefresh={refresh}
                onRead={handleRead}
                onUnread={handleUnread}
                onReadAll={handleReadAll}
                onDelete={handleDelete}
            />
        </Popover>
    );
}
