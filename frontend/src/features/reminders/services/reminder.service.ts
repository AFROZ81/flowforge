import api from "@/lib/api";

import type {
    Reminder,
    ReminderApiResponse,
    UpdateReminderRequest,
} from "../types/reminder";


/* =========================================================
   UPDATE / CREATE REMINDER
========================================================= */

export async function updateReminder(
    data: UpdateReminderRequest
): Promise<Reminder | null> {

    const response =
        await api.patch<
            ReminderApiResponse<Reminder>
        >(
            "/Reminders",
            data
        );


    return response.data?.data ?? null;
}


/* =========================================================
   UPCOMING REMINDERS
========================================================= */

export async function getUpcomingReminders(
    days = 5
): Promise<Reminder[]> {

    const response =
        await api.get<
            ReminderApiResponse<Reminder[]>
        >(
            "/Reminders/upcoming",
            {
                params: {
                    Days: days,
                },
            }
        );


    return response.data?.data ?? [];
}


/* =========================================================
   OVERDUE REMINDERS
========================================================= */

export async function getOverdueReminders(): Promise<Reminder[]> {

    const response =
        await api.get<
            ReminderApiResponse<Reminder[]>
        >(
            "/Reminders/overdue"
        );


    return response.data?.data ?? [];
}


/* =========================================================
   DELETE REMINDER
========================================================= */

export async function deleteReminder(
    workItemId: string
): Promise<void> {

    await api.delete(
        `/Reminders/${workItemId}`
    );
}