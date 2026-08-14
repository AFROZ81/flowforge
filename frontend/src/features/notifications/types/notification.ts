export type Notification = {
    id: string;
    type: string;
    title: string;
    message: string;
    workItemId?: string | null;
    isRead: boolean;
    readAt?: string | null;
    createdAt: string;
};


export type NotificationsResponse = {
    success: boolean;
    message: string;
    data: Notification[];
    traceId?: string | null;
    errors?: unknown;
};


export type UnreadCountResponse = {
    success: boolean;
    message: string;
    data: {
        unreadCount: number;
    };
    traceId?: string | null;
    errors?: unknown;
};