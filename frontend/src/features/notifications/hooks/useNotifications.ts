import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markNotificationAsUnread,
    markAllNotificationsAsRead,
    deleteNotification,
} from "../api/notificationsApi";

import type {
    Notification,
} from "../types/notification";


/* =========================================================
   EVENTS
   ========================================================= */

const NOTIFICATION_RECEIVED_EVENT =
    "flowforge:notification-received";


const NOTIFICATIONS_REFRESH_EVENT =
    "flowforge:notifications-refresh";


/* =========================================================
   HOOK
   ========================================================= */

export function useNotifications() {

    const [
        notifications,
        setNotifications,
    ] = useState<Notification[]>([]);


    const [
        unreadCount,
        setUnreadCount,
    ] = useState(0);


    const [
        isLoading,
        setIsLoading,
    ] = useState(true);


    const [
        isRefreshing,
        setIsRefreshing,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );


    /*
     * Prevent multiple simultaneous
     * realtime refreshes.
     */
    const refreshInProgressRef =
        useRef(false);


    /* =====================================================
       LOAD ALL
       ===================================================== */

    const loadNotifications =
        useCallback(
            async () => {

                try {

                    setError(null);


                    const [
                        notificationData,
                        count,
                    ] =
                        await Promise.all([
                            getNotifications(),
                            getUnreadCount(),
                        ]);


                    setNotifications(
                        notificationData
                    );


                    setUnreadCount(
                        count
                    );

                } catch (
                    error
                ) {

                    console.error(
                        "Notifications: failed to load:",
                        error
                    );


                    setError(
                        error instanceof Error
                            ? error.message
                            : "Failed to load notifications."
                    );

                } finally {

                    setIsLoading(false);
                }
            },
            []
        );


    /* =====================================================
       INITIAL LOAD
       ===================================================== */

    useEffect(() => {

        void loadNotifications();

    }, [
        loadNotifications,
    ]);


    /* =====================================================
       REFRESH
       ===================================================== */

    const refresh =
        useCallback(
            async () => {

                /*
                 * Don't allow several realtime
                 * events to trigger multiple
                 * simultaneous requests.
                 */
                if (
                    refreshInProgressRef.current
                ) {
                    return;
                }


                try {

                    refreshInProgressRef.current =
                        true;


                    setIsRefreshing(
                        true
                    );


                    const [
                        notificationData,
                        count,
                    ] =
                        await Promise.all([
                            getNotifications(),
                            getUnreadCount(),
                        ]);


                    setNotifications(
                        notificationData
                    );


                    setUnreadCount(
                        count
                    );


                    setError(
                        null
                    );

                } catch (
                    error
                ) {

                    console.error(
                        "Notifications: refresh failed:",
                        error
                    );


                    setError(
                        error instanceof Error
                            ? error.message
                            : "Failed to refresh notifications."
                    );

                } finally {

                    refreshInProgressRef.current =
                        false;


                    setIsRefreshing(
                        false
                    );
                }
            },
            []
        );


    /* =====================================================
       REALTIME NOTIFICATION LISTENER
       ===================================================== */

    useEffect(() => {

        /*
         * This event is dispatched by the existing
         * PresenceContext SignalR connection when
         * NotificationReceived arrives.
         */
        const handleNotificationReceived =
            () => {

                console.log(
                    "Notifications: realtime event received. Refreshing..."
                );


                void refresh();
            };


        /*
         * This event is used after SignalR reconnects.
         */
        const handleNotificationsRefresh =
            () => {

                console.log(
                    "Notifications: SignalR reconnect refresh."
                );


                void refresh();
            };


        window.addEventListener(
            NOTIFICATION_RECEIVED_EVENT,
            handleNotificationReceived
        );


        window.addEventListener(
            NOTIFICATIONS_REFRESH_EVENT,
            handleNotificationsRefresh
        );


        return () => {

            window.removeEventListener(
                NOTIFICATION_RECEIVED_EVENT,
                handleNotificationReceived
            );


            window.removeEventListener(
                NOTIFICATIONS_REFRESH_EVENT,
                handleNotificationsRefresh
            );
        };

    }, [
        refresh,
    ]);


    /* =====================================================
       MARK READ
       ===================================================== */

    const markAsRead =
        useCallback(
            async (
                notificationId: string
            ) => {

                /*
                 * Find the current notification
                 * before changing state.
                 */
                const notification =
                    notifications.find(
                        item =>
                            item.id ===
                            notificationId
                    );


                /*
                 * If it is already read, don't
                 * decrease the unread count again.
                 */
                if (
                    notification?.isRead
                ) {
                    return;
                }


                await markNotificationAsRead(
                    notificationId
                );


                setNotifications(
                    current =>
                        current.map(
                            notification =>
                                notification.id ===
                                notificationId
                                    ? {
                                          ...notification,

                                          isRead:
                                              true,

                                          readAt:
                                              new Date().toISOString(),
                                      }
                                    : notification
                        )
                );


                setUnreadCount(
                    current =>
                        Math.max(
                            current - 1,
                            0
                        )
                );
            },
            [
                notifications,
            ]
        );


    /* =====================================================
       MARK UNREAD
       ===================================================== */

    const markAsUnread =
        useCallback(
            async (
                notificationId: string
            ) => {

                /*
                 * Prevent the count from increasing
                 * twice if the notification is already
                 * unread.
                 */
                const notification =
                    notifications.find(
                        item =>
                            item.id ===
                            notificationId
                    );


                if (
                    notification &&
                    !notification.isRead
                ) {
                    return;
                }


                await markNotificationAsUnread(
                    notificationId
                );


                setNotifications(
                    current =>
                        current.map(
                            notification =>
                                notification.id ===
                                notificationId
                                    ? {
                                          ...notification,

                                          isRead:
                                              false,

                                          readAt:
                                              null,
                                      }
                                    : notification
                        )
                );


                setUnreadCount(
                    current =>
                        current + 1
                );
            },
            [
                notifications,
            ]
        );


    /* =====================================================
       MARK ALL READ
       ===================================================== */

    const markAllAsRead =
        useCallback(
            async () => {

                if (
                    unreadCount === 0
                ) {
                    return;
                }


                await markAllNotificationsAsRead();


                const now =
                    new Date().toISOString();


                setNotifications(
                    current =>
                        current.map(
                            notification => ({
                                ...notification,

                                isRead:
                                    true,

                                readAt:
                                    notification.readAt ??
                                    now,
                            })
                        )
                );


                setUnreadCount(
                    0
                );
            },
            [
                unreadCount,
            ]
        );


    /* =====================================================
       DELETE
       ===================================================== */

    const remove =
        useCallback(
            async (
                notificationId: string
            ) => {

                const notification =
                    notifications.find(
                        item =>
                            item.id ===
                            notificationId
                    );


                await deleteNotification(
                    notificationId
                );


                setNotifications(
                    current =>
                        current.filter(
                            item =>
                                item.id !==
                                notificationId
                        )
                );


                if (
                    notification &&
                    !notification.isRead
                ) {

                    setUnreadCount(
                        current =>
                            Math.max(
                                current - 1,
                                0
                            )
                    );
                }
            },
            [
                notifications,
            ]
        );


    /* =====================================================
       RETURN
       ===================================================== */

    return {
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
    };
}