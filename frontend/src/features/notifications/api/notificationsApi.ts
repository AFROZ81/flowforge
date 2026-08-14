import type {
    Notification,
    NotificationsResponse,
    UnreadCountResponse,
} from "../types/notification";

import { useAuthStore } from "@/stores/auth.store";


const API_BASE_URL =
    import.meta.env.VITE_API_URL ??
    "http://localhost:5045/api";


const NOTIFICATIONS_URL =
    `${API_BASE_URL}/Notifications`;


/* =========================================================
   AUTH TOKEN
   ========================================================= */

function getAccessToken(): string | null {

    const token =
        useAuthStore.getState().accessToken;


    if (
        typeof token !== "string" ||
        !token.trim()
    ) {
        return null;
    }


    return token
        .replace(
            /^Bearer\s+/i,
            ""
        )
        .trim() || null;
}


/* =========================================================
   REQUEST HEADERS
   ========================================================= */

function getHeaders(): HeadersInit {

    const token =
        getAccessToken();


    return {
        Accept:
            "application/json",

        ...(token
            ? {
                  Authorization:
                      `Bearer ${token}`,
              }
            : {}),
    };
}


/* =========================================================
   GET ALL NOTIFICATIONS
   ========================================================= */

export async function getNotifications():
    Promise<Notification[]> {

    const response =
        await fetch(
            NOTIFICATIONS_URL,
            {
                method:
                    "GET",

                headers:
                    getHeaders(),
            }
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load notifications. Status: ${response.status}`
        );
    }


    const result:
        NotificationsResponse =
        await response.json();


    if (!result.success) {

        throw new Error(
            result.message ||
            "Failed to load notifications."
        );
    }


    return Array.isArray(
        result.data
    )
        ? result.data
        : [];
}


/* =========================================================
   GET UNREAD COUNT
   ========================================================= */

export async function getUnreadCount():
    Promise<number> {

    const response =
        await fetch(
            `${NOTIFICATIONS_URL}/unread-count`,
            {
                method:
                    "GET",

                headers:
                    getHeaders(),
            }
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load unread notification count. Status: ${response.status}`
        );
    }


    const result:
        UnreadCountResponse =
        await response.json();


    if (!result.success) {

        throw new Error(
            result.message ||
            "Failed to load unread notification count."
        );
    }


    return Number(
        result.data?.unreadCount ??
        0
    );
}


/* =========================================================
   MARK AS READ
   ========================================================= */

export async function markNotificationAsRead(
    notificationId: string
): Promise<void> {

    const response =
        await fetch(
            `${NOTIFICATIONS_URL}/${notificationId}/read`,
            {
                method:
                    "PATCH",

                headers:
                    getHeaders(),
            }
        );


    if (!response.ok) {

        throw new Error(
            `Failed to mark notification as read. Status: ${response.status}`
        );
    }
}


/* =========================================================
   MARK AS UNREAD
   ========================================================= */

export async function markNotificationAsUnread(
    notificationId: string
): Promise<void> {

    const response =
        await fetch(
            `${NOTIFICATIONS_URL}/${notificationId}/unread`,
            {
                method:
                    "PATCH",

                headers:
                    getHeaders(),
            }
        );


    if (!response.ok) {

        throw new Error(
            `Failed to mark notification as unread. Status: ${response.status}`
        );
    }
}


/* =========================================================
   MARK ALL AS READ
   ========================================================= */

export async function markAllNotificationsAsRead():
    Promise<void> {

    const response =
        await fetch(
            `${NOTIFICATIONS_URL}/read-all`,
            {
                method:
                    "PATCH",

                headers:
                    getHeaders(),
            }
        );


    if (!response.ok) {

        throw new Error(
            `Failed to mark all notifications as read. Status: ${response.status}`
        );
    }
}


/* =========================================================
   DELETE NOTIFICATION
   ========================================================= */

export async function deleteNotification(
    notificationId: string
): Promise<void> {

    const response =
        await fetch(
            `${NOTIFICATIONS_URL}/${notificationId}`,
            {
                method:
                    "DELETE",

                headers:
                    getHeaders(),
            }
        );


    if (!response.ok) {

        throw new Error(
            `Failed to delete notification. Status: ${response.status}`
        );
    }
}


/* =========================================================
   GET SINGLE NOTIFICATION
   ========================================================= */

export async function getNotification(
    notificationId: string
): Promise<Notification> {

    const response =
        await fetch(
            `${NOTIFICATIONS_URL}/${notificationId}`,
            {
                method:
                    "GET",

                headers:
                    getHeaders(),
            }
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load notification. Status: ${response.status}`
        );
    }


    const result:
        {
            success: boolean;
            message: string;
            data: Notification;
            traceId?: string | null;
            errors?: unknown;
        } =
        await response.json();


    if (!result.success) {

        throw new Error(
            result.message ||
            "Failed to load notification."
        );
    }


    return result.data;
}