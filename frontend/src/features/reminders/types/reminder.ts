export type Reminder = {
    workItemId: string;
    title: string;
    dueDate: string | null;
    reminderDate?: string | null;
};


export type UpdateReminderRequest = {
    workItemId: string;
    reminderDate: string;
};


export type ReminderApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
    traceId?: string | null;
    errors?: unknown;
};