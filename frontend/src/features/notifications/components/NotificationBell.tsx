import {
    Bell,
} from "lucide-react";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    toast,
} from "sonner";

import {
    useNotifications,
} from "../hooks/useNotifications";

import NotificationDropdown from "./NotificationDropdown";


export default function NotificationBell() {

    const [
        isOpen,
        setIsOpen,
    ] = useState(false);


    const containerRef =
        useRef<HTMLDivElement>(
            null
        );


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
    } =
        useNotifications();


    /* =====================================================
       CLOSE WHEN CLICKING OUTSIDE
       ===================================================== */

    useEffect(() => {

        function handleOutsideClick(
            event: MouseEvent
        ) {

            if (
                !containerRef.current
            ) {
                return;
            }


            if (
                !containerRef.current.contains(
                    event.target as Node
                )
            ) {

                setIsOpen(
                    false
                );
            }
        }


        if (isOpen) {

            document.addEventListener(
                "mousedown",
                handleOutsideClick
            );
        }


        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };

    }, [
        isOpen,
    ]);


    /* =====================================================
       MARK READ
       ===================================================== */

    const handleRead =
        async (
            notificationId: string
        ) => {

            try {

                await markAsRead(
                    notificationId
                );

            } catch (error) {

                console.error(
                    "Failed to mark notification as read:",
                    error
                );

                toast.error(
                    "Failed to mark notification as read."
                );
            }
        };


    /* =====================================================
       MARK UNREAD
       ===================================================== */

    const handleUnread =
        async (
            notificationId: string
        ) => {

            try {

                await markAsUnread(
                    notificationId
                );

            } catch (error) {

                console.error(
                    "Failed to mark notification as unread:",
                    error
                );

                toast.error(
                    "Failed to mark notification as unread."
                );
            }
        };


    /* =====================================================
       MARK ALL READ
       ===================================================== */

    const handleReadAll =
        async () => {

            try {

                await markAllAsRead();

                toast.success(
                    "All notifications marked as read."
                );

            } catch (error) {

                console.error(
                    "Failed to mark all notifications as read:",
                    error
                );

                toast.error(
                    "Failed to mark all notifications as read."
                );
            }
        };


    /* =====================================================
       DELETE
       ===================================================== */

    const handleDelete =
        async (
            notificationId: string
        ) => {

            try {

                await remove(
                    notificationId
                );

            } catch (error) {

                console.error(
                    "Failed to delete notification:",
                    error
                );

                toast.error(
                    "Failed to delete notification."
                );
            }
        };


    return (
        <div
            ref={containerRef}
            className="
                relative
                flex
                items-center
            "
        >

            {/* Bell button */}

            <button
                type="button"
                aria-label="Notifications"
                aria-expanded={isOpen}
                className="
                    relative
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-md
                    text-muted-foreground
                    transition-colors
                    hover:bg-muted
                    hover:text-foreground
                    focus:outline-none
                    focus:ring-2
                    focus:ring-ring
                    focus:ring-offset-1
                "
                onClick={() =>
                    setIsOpen(
                        current =>
                            !current
                    )
                }
            >

                <Bell
                    className="
                        h-[18px]
                        w-[18px]
                    "
                />


                {/* Unread badge */}

                {unreadCount > 0 && (
                    <span
                        className="
                            absolute
                            right-0
                            top-0
                            flex
                            min-h-[16px]
                            min-w-[16px]
                            translate-x-1/4
                            -translate-y-1/4
                            items-center
                            justify-center
                            rounded-full
                            bg-red-500
                            px-1
                            text-[9px]
                            font-bold
                            leading-none
                            text-white
                            ring-2
                            ring-background
                        "
                    >
                        {unreadCount >
                        99
                            ? "99+"
                            : unreadCount}
                    </span>
                )}

            </button>


            {/* Dropdown */}

            {isOpen && (
                <NotificationDropdown
                    notifications={
                        notifications
                    }
                    unreadCount={
                        unreadCount
                    }
                    isLoading={
                        isLoading
                    }
                    isRefreshing={
                        isRefreshing
                    }
                    onRefresh={
                        refresh
                    }
                    onRead={
                        handleRead
                    }
                    onUnread={
                        handleUnread
                    }
                    onReadAll={
                        handleReadAll
                    }
                    onDelete={
                        handleDelete
                    }
                />
            )}

        </div>
    );
}