export type Reminder = {
    workItemId: string;
    title: string;
    dueDate: string;
    reminderDate?: string | null;
};


export type UpdateReminderRequest = {
    workItemId: string;
    dueDate: string;
    reminderDate: string;
};


export type ReminderApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
    traceId?: string | null;
    errors?: unknown;
};